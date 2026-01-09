import { WorkoutType } from "@prisma/client";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const workoutPlanRouter = createTRPCRouter({
    getWorkout: publicProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ input, ctx }) => {
            const workout = await ctx.db.workout.findFirstOrThrow({
                where: {
                    id: input.id
                },
                include: {
                    WorkoutBlock: {
                        include: {
                            exercisePlanning: {
                                include: {
                                    exercise: true,
                                    rounds: true,
                                    planningAlternative: {
                                        include: {
                                            exercise: true
                                        }
                                    }
                                }
                            },
                        }
                    },
                    location: true,
                },
            });

            return workout
        }),

    copyAndCreate: publicProcedure
        .input(z.object({
            workoutId: z.string(),
            date: z.date().nullable(),
            includeTime: z.boolean(),
            locationId: z.string().nullable(),
        }))
        .mutation(async ({ ctx, input }) => {
            // fetch the workout we copy it from
            const workout = await ctx.db.workout.findFirstOrThrow({
                where: {
                    id: input.workoutId
                },
                include: {
                    location: true,
                    WorkoutBlock: {
                        include: {
                            exercisePlanning: {
                                include: {
                                    planningAlternative: true
                                }
                            }
                        }
                    }
                }
            })

            if (!input.date) {
                return new Error("Date is required to create a new workout");
            }

            // create the new workout
            const newWorkout = await ctx.db.workout.create({
                data: {
                    name: workout.name,
                    completed: false,
                    date: input.date,
                    includeTime: input.includeTime,
                    locationId: input.locationId,
                    notes: workout.notes,
                    type: workout.type,
                }
            })

            for (const i of workout.WorkoutBlock) {
                await ctx.db.workoutBlock.create({
                    data: {
                        workoutId: newWorkout.id,
                        name: i.name,
                        notes: i.notes,
                        completed: false,
                        maxDurationMin: i.maxDurationMin,
                        style: i.style,
                        rounds: i.rounds,
                        exercisePlanning: {
                            createMany: {
                                data: i.exercisePlanning.map((e) => ({
                                    ...e,
                                    blockId: undefined,
                                    id: undefined,
                                    updatedAt: undefined,
                                    createdAt: undefined,
                                    planningAlternative: undefined
                                }))
                            }
                        }
                    }
                })
            }

            // also create the planning
            return await ctx.db.workoutPlanning.create({
                data: {
                    date: input.date,
                    includeTime: input.includeTime,
                    locationId: input.locationId,
                    workoutId: newWorkout.id
                }
            })
        }),

    update: publicProcedure
        .input(z.object({
            id: z.string(),
            name: z.string().min(1),
            date: z.date(),
            notes: z.string().optional(),
            includeTime: z.boolean(),
            type: z.nativeEnum(WorkoutType).optional(),
            locationId: z.string().nullable()
        }))
        .mutation(async ({ ctx, input }) => {
            const workout = await ctx.db.workout.update({
                where: {
                    id: input.id
                },
                data: {
                    name: input.name,
                    date: input.date,
                    includeTime: input.includeTime ? input.includeTime : false,
                    locationId: input.locationId,
                    type: input.type ? input.type : WorkoutType.OPEN,
                }
            });
            return workout;
        }
        ),

    markAsFinished: publicProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input, ctx }) => {
            const workout = await ctx.db.workout.update({
                where: {
                    id: input.id
                },
                data: {
                    completed: true
                }
            });

            // also mark all blocks as completed
            await ctx.db.workoutBlock.updateMany({
                where: {
                    workoutId: input.id
                },
                data: {
                    completed: true
                }
            });

            return workout
        }),

    getNames: publicProcedure
        .query(async ({ ctx }) => {
            const workouts = await ctx.db.workout.findMany({
                select: {
                    id: true,
                    name: true,
                    date: true,

                }
            });

            // create a set of unique names
            const uniqueNames = new Set<string>();
            const uniqueWorkouts = workouts.filter((workout) => {
                const name = workout.name;
                if (uniqueNames.has(name)) {
                    return false;
                } else {
                    uniqueNames.add(name);
                    return true;
                }
            });

            return uniqueWorkouts
        }),

    getAll: publicProcedure
        .query(async ({ ctx }) => {
            const workouts = await ctx.db.workout.findMany({
                include: {
                    location: true,
                    WorkoutBlock: true
                },
            });
            return workouts
        }),

    getUpcoming: publicProcedure
        .query(async ({ ctx }) => {
            const workouts = await ctx.db.workout.findMany({
                where: {
                    date: {
                        gte: new Date()
                    }
                },
            });

            return workouts
        }),



    delete: publicProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input, ctx }) => {
            const workout = await ctx.db.workoutPlanning.delete({
                where: {
                    id: input.id
                }
            });

            return workout
        }),

    getPast: publicProcedure
        .query(async ({ ctx }) => {
            const workouts = await ctx.db.workout.findMany({
                where: {
                    date: {
                        lt: new Date()
                    }
                },
            });

            return workouts
        }),

    create: publicProcedure
        .input(z.object({
            // For new workout
            name: z.string().min(1).optional(),
            type: z.nativeEnum(WorkoutType).optional(),
            notes: z.string().optional(),
            // For existing workout
            workoutId: z.string().optional(),
            // Common fields for planning
            date: z.date(),
            includeTime: z.boolean(),
            locationId: z.string().nullable()
        }))
        .mutation(async ({ ctx, input }) => {
            let workoutId: string;

            // If workoutId is provided, use existing workout
            if (input.workoutId) {
                workoutId = input.workoutId;
            } else {
                // Otherwise, create a new workout
                if (!input.name) {
                    throw new Error("Name is required when creating a new workout");
                }
                const workout = await ctx.db.workout.create({
                    data: {
                        name: input.name,
                        date: input.date,
                        includeTime: input.includeTime ? input.includeTime : false,
                        type: input.type ? input.type : WorkoutType.OPEN,
                        notes: input.notes,
                        locationId: input.locationId
                    }
                });
                workoutId = workout.id;
            }

            // Create the planning with the workout (new or existing)
            const planning = await ctx.db.workoutPlanning.create({
                data: {
                    date: input.date,
                    includeTime: input.includeTime,
                    locationId: input.locationId,
                    workoutId: workoutId,
                    userId: ctx.session?.user?.id
                }
            });

            return planning;
        }
        ),
});
