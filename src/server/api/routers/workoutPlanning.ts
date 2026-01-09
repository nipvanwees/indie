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
                    location: true
                }
            })
        }),
    getAll: publicProcedure
        .query(async ({ ctx }) => {
            return await ctx.db.workoutPlanning.findMany({
                where: {
                    workoutPlan: {
                        userId: ctx.session?.user?.id
                    }
                },
                include: {
                    workoutPlan: true,
                    location: true
                }
            })
        })
});
