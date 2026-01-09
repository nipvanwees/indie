import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { RepStyle } from "@prisma/client";

export const utilsRouter = createTRPCRouter({

    fromPlanToPlanning: publicProcedure
     .mutation(async ({ ctx }) => {
        const plannings = await ctx.db.workout.findMany();

        // async loop over all plannings
            for(const plan of plannings) {
                // check if planning already exists
                if(!plan.date) {
                    return
                }
                const check = await ctx.db.workoutPlanning.findFirst({
                    where: {
                        date: plan.date,
                        workoutId: plan.id
                    }
                })

                if(check) {
                    console.log("already existss this one..")
                    continue
                } else {
                    // create the workout planning
                    await ctx.db.workoutPlanning.create({
                        data: {
                            date: plan.date,
                            includeTime: plan.includeTime,
                            locationId: plan.locationId,
                            workoutId: plan.id,
                        }
                    })
                }
            }

     }),

    fixTypes: publicProcedure
        .mutation(async ({ ctx }) => {
            await ctx.db.exercisePlanning.updateMany({
                where: {
                    repStyle: "reps"
                },
                data: {
                    repType: RepStyle.REPS
                }
            });

            await ctx.db.exercisePlanning.updateMany({
                where: {
                    repStyle: "time"
                },
                data: {
                    repType: RepStyle.TIME
                }
            });

             await ctx.db.exercisePlanning.updateMany({
                where: {
                    repStyle: "distance"
                },
                data: {
                    repType: RepStyle.METERS
                }
            });

        }),
    })



