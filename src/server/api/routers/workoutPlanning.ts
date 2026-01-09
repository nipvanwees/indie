import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const workoutPlanningRouter = createTRPCRouter({
    //TODO: make this private
    getPersonal: publicProcedure
        .query(async ({ ctx }) => {
            return await ctx.db.workoutPlanning.findMany({
                where: {
                    userId: ctx.session?.user?.id
                },
                include: {
                    workout: true,
                    location: true,
                }
            })
        }),

    getAll: publicProcedure
        .query(async ({ ctx }) => {
            return await ctx.db.workoutPlanning.findMany({
                where: {
                    workout: {
                        userId: ctx.session?.user?.id
                    }
                },
                include: {
                    workout: true,
                    location: true
                }
            })
        }),

    update: publicProcedure
        .input(z.object({
            id: z.string(),
            date: z.date(),
            includeTime: z.boolean(),
            locationId: z.string().nullable()
        }))
        .mutation(async ({ ctx, input }) => {
            return await ctx.db.workoutPlanning.update({
                where: {
                    id: input.id
                },
                data: {
                    date: input.date,
                    includeTime: input.includeTime,
                    locationId: input.locationId
                }
            });
        })
});
