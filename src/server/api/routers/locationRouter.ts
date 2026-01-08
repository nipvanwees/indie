import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const locationRouter = createTRPCRouter({
    getAll: publicProcedure
        .query(async ({ ctx }) => {
            const locations = await ctx.db.locations.findMany();

            return locations
        }),

    create: publicProcedure
        .input(z.object({
            name: z.string().min(1),
            notes: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            return ctx.db.locations.create({
                data: {
                    name: input.name,
                    public: false
                    // notes: input.notes,
                },
            });
        }
    ),

    connectToWorkout: publicProcedure
        .input(z.object({
            workoutId: z.string(),
            locationId: z.string(),
        }))
        .mutation(async ({ ctx, input }) => {
            return ctx.db.workoutPlan.update({
                where: {
                    id: input.workoutId,
                },
                data: {
                    locationId: input.locationId,
                },
            });
        }
    ),

});