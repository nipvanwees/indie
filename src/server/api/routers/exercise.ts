import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const exerciseRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const exercises = await ctx.db.exercise.findMany({
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        bodyweight: true,
        exernalWeight: true,
      },
    });

    return exercises;
  }),
});

