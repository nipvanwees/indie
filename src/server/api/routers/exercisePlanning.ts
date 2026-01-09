import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import type { Exercise, ExercisePlanning } from "@prisma/client";
import { AlternativeType, BlockPurpose, RepStyle, TimeStyle, UnilateralExecution, WorkoutType } from "@prisma/client";

export const exercisePlanRouter = createTRPCRouter({
    addExercise: publicProcedure
    .input(z.object({
        blockId: z.string(),
        exerciseId: z.string(),
        minReps: z.number().nullable(),
        maxReps: z.number().nullable(),
        repType: z.nativeEnum(RepStyle),
        maxEffort: z.boolean().nullable(),
        alternatives: z.array(z.object({
            type: z.nativeEnum(AlternativeType),
            exerciseId: z.string(),
            notes: z.string().nullable()
        })).nullable(),
        useAsBuyIn: z.boolean().nullable(),
        unilateralExecution: z.nativeEnum(UnilateralExecution).nullable(),
        timeStyle: z.nativeEnum(TimeStyle).nullable(),
        notes: z.string().nullable().default(""),
        useTempo: z.boolean().nullable(),
        tempoEccentric: z.number().nullable(),
        tempoIsometricBottom: z.number().nullable(),
        tempoConcentric: z.number().nullable(),
        tempoIsometricTop: z.number().nullable(),
        useRx: z.boolean().nullable(),
        rxDouble: z.boolean().nullable(),
        rxM: z.number().nullable(),
        rxF: z.number().nullable(),
        rounds: z.array(z.object({
            min: z.number().nullable(),
            max: z.number().nullable(),
            rpe: z.number().nullable(),
            notes: z.string().nullable(),
        })).nullable(),
    }))
    .mutation(async ({ input, ctx }) => {
        const exercisePlan = await ctx.db.exercisePlanning.create({
            data: {
                blockId: input.blockId,
                exerciseId: input.exerciseId,
                minReps: input.minReps ? input.minReps : 0,
                maxReps: input.maxReps ? input.maxReps : 0,
                maxEffort: input.maxEffort ? input.maxEffort : false,
                // repStyle: input.repStyle ? input.repStyle : "reps",
                repType: input.repType ? input.repType : RepStyle.REPS,
                notes: input.notes,
                useTempo: input.useTempo ? input.useTempo : false,
                tempoEccentric: input.tempoEccentric ?? undefined,
                tempoIsometricBottom: input.tempoIsometricBottom ?? undefined,
                tempoConcentric: input.tempoConcentric ?? undefined,
                tempoIsometricTop: input.tempoIsometricTop ?? undefined,
                unilateralExecution: input.unilateralExecution ? input.unilateralExecution : UnilateralExecution.NONE,
                timeStyle: input.timeStyle ? input.timeStyle : null,
                useRx: input.useRx ? input.useRx : false,
                rxDouble: input.rxDouble ? input.rxDouble : false,
                rxM: input.rxM ? input.rxM : null,
                rxF: input.rxF ? input.rxF : null,
                useAsBuyIn: input.useAsBuyIn ? input.useAsBuyIn : false,
                rounds: 
                    {
                        createMany: {
                            data: input.rounds?.map((round) => ({
                                min: round.min ?? null,
                                max: round.max ?? null,
                                rpe: round.rpe ?? null,
                                notes: round.notes ?? null,
                            })) ?? []                        
                    }
                }
            },
        });   

        if(input.alternatives && input.alternatives.length > 0) {
               await ctx.db.planningAlternative.createMany({
                data: 
                    input.alternatives.map((alternative) => ({
                        planningId: exercisePlan.id,
                        exerciseId: alternative.exerciseId,
                        type: alternative.type,
                    }))
               
            });
       } 

        return exercisePlan;
    }), 


    getPreviouslyPlanned: publicProcedure
    .input(z.object({
        exerciseId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
        // make later smarter ay
         return await ctx.db.exercisePlanning.findMany({
            where: {
                exerciseId: input.exerciseId,
            },
            include: {
                planningAlternative: true,
                exercise: true,
           },
            orderBy: {
                createdAt: "desc",
            },
            take: 10,
        });
    }
    ),
   

    getSuggestions: publicProcedure
        .input(z.object({
            blockId: z.string(),
            blockPurpose: z.nativeEnum(BlockPurpose),
            workoutId: z.string(),
        }))
    .query(async ({ ctx, input }) => {
        // get workout 
        const workout = await ctx.db.workoutPlan.findUnique({
            where: {
                id: input.workoutId,
            },
            include: {
                WorkoutBlock: {
                    include: {
                        exercisePlanning: {
                            include: {
                                exercise: true,
                                planningAlternative: true,
                            }
                        }
                    }
                }
            }
        });

        // flatlist of all exercises in the workout
        const allExercisesInWorkout = workout?.WorkoutBlock.flatMap((block) =>
            block.exercisePlanning.map((exercise) => exercise.exercise.id)
        ) ?? [];


        // get similar blocks
        const similarWorkouts = await ctx.db.workoutPlan.findMany({
            where: {
                id: {
                    not: input.workoutId,
                },
                type: workout?.type,
                completed: true,

            },
            include: {
                WorkoutBlock: {
                    where: {
                        blockPurpose: input.blockPurpose,
                        id: {
                            not: input.blockId
                        }
                    },
                    include: {
                        exercisePlanning: {
                            include: {
                                exercise: true,
                                planningAlternative: true,
                            }
                        }
                    }

                }
            }
        });

        if(similarWorkouts.length === 0) {
            return ctx.db.exercisePlanning.findMany({
                include: {
                    exercise: true,
                },
               take: 10
            });
        }

        type Res = ExercisePlanning & { exercise: Exercise };

        const res:Res[] = []

        similarWorkouts.forEach((workout) => {
            workout.WorkoutBlock.forEach((block) => {
                block.exercisePlanning.forEach((exercise) => {
                    if(!res.find((e) => e.id === exercise.id) && !allExercisesInWorkout.includes(exercise.exercise.id)) {
                        res.push(exercise);
                    }
                });
            })
        })

        return res
    }),

    updateExercisePlan: publicProcedure
    .input(z.object({
        id: z.string(),
        exerciseId: z.string(),
        minReps: z.number().optional().nullable(),
        maxReps: z.number().optional().nullable(),
        maxEffort: z.boolean().nullable(),
       alternatives: z.array(z.object({
            type: z.nativeEnum(AlternativeType),
            exerciseId: z.string(),
            notes: z.string().nullable()
        })).nullable(),
        unilateralExecution: z.nativeEnum(UnilateralExecution).nullable(),
        timeStyle: z.nativeEnum(TimeStyle).nullable(),
        notes: z.string().nullable().default(""),
        useTempo: z.boolean().nullable(),
        useAsBuyIn: z.boolean().nullable(),
        tempoEccentric: z.number().nullable(),
        tempoIsometricBottom: z.number().nullable(),
        tempoConcentric: z.number().nullable(),
        tempoIsometricTop: z.number().nullable(),
        repType: z.nativeEnum(RepStyle),
        useRx: z.boolean().nullable(),
        rxDouble: z.boolean().nullable(),
        rxM: z.number().nullable(),
        rxF: z.number().nullable(),
        rounds: z.array(z.object({
            min: z.number().nullable(),
            max: z.number().nullable(),
            rpe: z.number().nullable(),
            notes: z.string().nullable(),
        })).nullable(),
    }))
    .mutation(async ({ input, ctx }) => {
        const exercise = await ctx.db.exercisePlanning.update({
            where: {
                id: input.id
            },
            data: {
                exerciseId: input.exerciseId,
                minReps: input.minReps ? input.minReps : 0,
                maxReps: input.maxReps ? input.maxReps : 0,
                maxEffort: input.maxEffort ? input.maxEffort : false,
                notes: input.notes,
                repType: input.repType,
                useTempo: input.useTempo ? input.useTempo : false,
                tempoEccentric: input.tempoEccentric ?? undefined,
                tempoIsometricBottom: input.tempoIsometricBottom ?? undefined,
                tempoConcentric: input.tempoConcentric ?? undefined,
                tempoIsometricTop: input.tempoIsometricTop ?? undefined,
                unilateralExecution: input.unilateralExecution ? input.unilateralExecution : undefined,
                timeStyle: input.timeStyle ? input.timeStyle : null,
                useAsBuyIn: input.useAsBuyIn ? input.useAsBuyIn : false,
                useRx: input.useRx ?? false,
                rxDouble: input.rxDouble ?? false,
                rxM: input.rxM,
                rxF: input.rxF,
           }
        });

        if(input.rounds && input.rounds.length > 0) {
            // delete existing rounds
            await ctx.db.rounds.deleteMany({
                where: {
                    exercisePlanningId: exercise.id
                }
            }); 

            // create new rounds
            await ctx.db.rounds.createMany({
                data: input.rounds.map((round) => ({
                    exercisePlanningId: exercise.id,
                    min: round.min ?? null,
                    max: round.max ?? null,
                    rpe: round.rpe ?? null,
                    notes: round.notes ?? null,
                }))
            });
        }

        if(input.alternatives && input.alternatives.length > 0) {
            // check if the alternative already exists
            const existingAlternatives = await ctx.db.planningAlternative.findMany({
                where: {
                    planningId: exercise.id
                }
            });
            // delete the existing alternatives
            if(existingAlternatives.length > 0) {
                await ctx.db.planningAlternative.deleteMany({
                    where: {
                        planningId: exercise.id
                    }
                });
            }

            await ctx.db.planningAlternative.createMany({
                skipDuplicates: true,
                data: 
                    input.alternatives.map((alternative) => ({
                        planningId: exercise.id,
                        exerciseId: alternative.exerciseId,
                        type: alternative.type,
                    }))
               
            });
        } 

        return exercise;
    }
    ),

    removeExercise: publicProcedure
    .input(z.object({
        id: z.string()
    }))
    .mutation(async ({ input, ctx }) => {
        const exercise = await ctx.db.exercisePlanning.delete({
            where: {
                id: input.id
            }
        });

        return exercise;
    }
    ),

    updateExercise: publicProcedure
    .input(z.object({
        id: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
        const exercise = await ctx.db.exercisePlanning.update({
            where: {
                id: input.id
            },
            data: {

            }
        });

        return exercise;
    }
    ),

})
