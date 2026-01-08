import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { WorkoutType, RepStyle, ActivityCategory } from "@prisma/client";

export const sessionRouter = createTRPCRouter({
    create: protectedProcedure
        .input(z.object({
            studentId: z.string().min(3),
            name: z.string().min(1, "Session name is required"),
            type: z.nativeEnum(WorkoutType).default(WorkoutType.STRENGTH),
            date: z.date(),
            includeTime: z.boolean().default(false),
            notes: z.string().optional(),
            locationId: z.string().optional(),
        }))
        .mutation(async ({ input, ctx }) => {
            const session = await ctx.db.session.create({
                data: {
                    userId: input.studentId,
                    name: input.name,
                    type: input.type,
                    date: input.date,
                    includeTime: input.includeTime,
                    notes: input.notes,
                    locationId: input.locationId,
                },
                include: {
                    location: true,
                    logs: {
                        include: {
                            exercise: true,
                        },
                    },
                },
            });
            return session;
        }),

    getByDate: protectedProcedure
        .input(z.object({
            studentId: z.string().min(3),
            date: z.date(),
        }))
        .query(async ({ input, ctx }) => {
            const startOfDay = new Date(input.date);
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date(input.date);
            endOfDay.setHours(23, 59, 59, 999);

            const sessions = await ctx.db.session.findMany({
                where: {
                    userId: input.studentId,
                    date: {
                        gte: startOfDay,
                        lte: endOfDay,
                    },
                },
                include: {
                    location: true,
                    logs: {
                        include: {
                            exercise: true,
                        },
                        orderBy: {
                            createdAt: 'asc',
                        },
                    },
                },
                orderBy: {
                    date: 'asc',
                },
            });

            return sessions;
        }),

    getById: protectedProcedure
        .input(z.object({
            sessionId: z.string().min(3),
        }))
        .query(async ({ input, ctx }) => {
            const session = await ctx.db.session.findUnique({
                where: {
                    id: input.sessionId,
                },
                include: {
                    location: true,
                    logs: {
                        include: {
                            exercise: true,
                        },
                        orderBy: {
                            createdAt: 'asc',
                        },
                    },
                },
            });

            if (!session) {
                throw new Error("Session not found");
            }

            return session;
        }),

    getAll: protectedProcedure
        .input(z.object({
            studentId: z.string().min(3),
            limit: z.number().min(1).max(100).default(50),
        }))
        .query(async ({ input, ctx }) => {
            const sessions = await ctx.db.session.findMany({
                where: {
                    userId: input.studentId,
                },
                include: {
                    location: true,
                    logs: {
                        include: {
                            exercise: true,
                        },
                    },
                },
                orderBy: {
                    date: 'desc',
                },
                take: input.limit,
            });

            return sessions;
        }),

    update: protectedProcedure
        .input(z.object({
            sessionId: z.string().min(3),
            name: z.string().min(1).optional(),
            type: z.nativeEnum(WorkoutType).optional(),
            date: z.date().optional(),
            includeTime: z.boolean().optional(),
            notes: z.string().optional(),
            locationId: z.string().optional(),
            completed: z.boolean().optional(),
        }))
        .mutation(async ({ input, ctx }) => {
            const { sessionId, ...updateData } = input;

            const session = await ctx.db.session.update({
                where: {
                    id: sessionId,
                },
                data: updateData,
                include: {
                    location: true,
                    logs: {
                        include: {
                            exercise: true,
                        },
                    },
                },
            });

            return session;
        }),

    delete: protectedProcedure
        .input(z.object({
            sessionId: z.string().min(3),
        }))
        .mutation(async ({ input, ctx }) => {
            // First delete all logs associated with this session
            await ctx.db.log.deleteMany({
                where: {
                    sessionId: input.sessionId,
                },
            });

            // Then delete the session
            await ctx.db.session.delete({
                where: {
                    id: input.sessionId,
                },
            });

            return { success: true };
        }),

    addLogToSession: protectedProcedure
        .input(z.object({
            sessionId: z.string().min(3),
            exerciseId: z.string().min(3),
            category: z.nativeEnum(ActivityCategory).default(ActivityCategory.BODYWEIGHT),
            repType: z.nativeEnum(RepStyle).default(RepStyle.REPS),
            reps: z.number().min(0).optional(),
            time: z.number().min(0).optional(), // in seconds
            distance: z.number().min(0).optional(), // in meters
            calories: z.number().min(0).optional(),
            weight: z.number().min(0).optional(),
            rpe: z.number().min(1).max(10).optional(),
            notes: z.string().optional(),
        }))
        .mutation(async ({ input, ctx }) => {
            // Get the session to get the userId and date
            const session = await ctx.db.session.findUnique({
                where: { id: input.sessionId },
                select: { userId: true, date: true },
            });

            if (!session) {
                throw new Error("Session not found");
            }

            // Validate that the appropriate value is provided based on repType
            const repType = input.repType;
            let repValue = null;

            switch (repType) {
                case RepStyle.REPS:
                    if (input.reps === undefined || input.reps < 0) {
                        throw new Error("Reps value is required for REPS type");
                    }
                    repValue = input.reps;
                    break;
                case RepStyle.TIME:
                    if (input.time === undefined || input.time < 0) {
                        throw new Error("Time value is required for TIME type");
                    }
                    repValue = input.time;
                    break;
                case RepStyle.METERS:
                    if (input.distance === undefined || input.distance < 0) {
                        throw new Error("Distance value is required for METERS type");
                    }
                    repValue = input.distance;
                    break;
                case RepStyle.CALORIES:
                    if (input.calories === undefined || input.calories < 0) {
                        throw new Error("Calories value is required for CALORIES type");
                    }
                    repValue = input.calories;
                    break;
            }

            const log = await ctx.db.log.create({
                data: {
                    userId: session.userId,
                    sessionId: input.sessionId,
                    exerciseId: input.exerciseId,
                    date: session.date,
                    dateString: session.date.toISOString().split('T')[0],
                    category: input.category,
                    repType: input.repType,
                    reps: repType === RepStyle.REPS ? repValue : null,
                    time: repType === RepStyle.TIME ? repValue : null,
                    distance: repType === RepStyle.METERS ? repValue : null,
                    calories: repType === RepStyle.CALORIES ? repValue : null,
                    weight: input.weight ?? 0,
                    rpe: input.rpe ?? 6,
                    notes: input.notes ?? "",
                },
                include: {
                    exercise: true,
                },
            });

            return log;
        }),

    removeLogFromSession: protectedProcedure
        .input(z.object({
            logId: z.string().min(3),
        }))
        .mutation(async ({ input, ctx }) => {
            await ctx.db.log.delete({
                where: {
                    id: input.logId,
                },
            });

            return { success: true };
        }),
});
