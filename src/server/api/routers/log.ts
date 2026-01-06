import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const logRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        exerciseId: z.string().min(1, "Exercise is required"),
        reps: z.number().int().positive().optional(),
        weight: z.number().int().positive().optional(),
        date: z.date().optional(),
        trainingSessionId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const date = input.date ?? new Date();
      const dateString = date.toISOString().split("T")[0] ?? "";

      const log = await ctx.db.log.create({
        data: {
          exerciseId: input.exerciseId,
          userId: ctx.session.user.id,
          date: date,
          dateString: dateString,
          reps: input.reps,
          weight: input.weight,
          repType: "REPS",
          category: "BODYWEIGHT",
          rpe: 5, // Default RPE, can be made configurable later
          notes: "",
          trainingSessionId: input.trainingSessionId,
        },
        include: {
          exercise: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return log;
    }),
});

