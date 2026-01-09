import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const workoutPlanningRouter = createTRPCRouter({
    getAll: publicProcedure
        .query(async ({ ctx }) => {
            console.log("ctx.session", ctx.session);
            console.log(ctx.session?.user?.id);
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
