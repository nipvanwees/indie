import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { Unilateral } from "@prisma/client";


export const exerciseRouter = createTRPCRouter({
    getAll: publicProcedure
        .query(async ({ ctx }) => {
            const exercises = await ctx.db.exercise.findMany();

            return exercises
        }),

        create: publicProcedure
        .input(z.object({ 
            name: z.string().min(1),
            notes: z.string().optional(),
            unilateral: z.nativeEnum(Unilateral).optional()
        }))
        .mutation(async ({ ctx, input }) => {
            return ctx.db.exercise.create({
                data: {
                    name: input.name,
                    // notes: input.notes,
                    unilateral: input.unilateral ? input.unilateral : Unilateral.NO
                },
            });
        }),

    getById: publicProcedure
        .input(z.object({
            id: z.string().min(1),
        }))
        .query(async ({ ctx, input }) => {
            const exercise = await ctx.db.exercise.findUnique({
                where: {
                    id: input.id,
                },
                include: {
                    Log: {
                        take: 100
                    }
                }
            });

            if (!exercise) {
                throw new Error("Exercise not found");
            }

            return exercise;
        }
    ),
});

    
        