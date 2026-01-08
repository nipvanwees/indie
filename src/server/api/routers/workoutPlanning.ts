import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const workoutPlanningRouter = createTRPCRouter({
    getAll: publicProcedure
        .query(async ({ ctx }) => {
            console.log("ctx.user", ctx.user);
            console.log(ctx.user?.id);
            return await ctx.db.workoutPlanning.findMany({
                where: {
                    workoutPlan: {
                        userId: ctx.user?.id
                    }
                },
                include: {
                    workoutPlan: true,
                    location: true
                }
            })
        })
});
