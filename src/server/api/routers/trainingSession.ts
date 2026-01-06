import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const trainingSessionRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required"),
        date: z.date(),
        includeTime: z.boolean().default(false),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const trainingSession = await ctx.db.trainingSession.create({
        data: {
          name: input.name,
          date: input.date,
          includeTime: input.includeTime,
          userId: ctx.session.user.id,
        },
      });

      return trainingSession;
    }),

  getLatest: protectedProcedure.query(async ({ ctx }) => {
    const sessions = await ctx.db.trainingSession.findMany({
      where: {
        userId: ctx.session.user.id,
      },
      orderBy: {
        date: "desc",
      },
      take: 5,
      select: {
        id: true,
        name: true,
        date: true,
        includeTime: true,
        completed: true,
        type: true,
        createdAt: true,
      },
    });

    return sessions;
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const session = await ctx.db.trainingSession.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
        include: {
          location: {
            select: {
              id: true,
              name: true,
            },
          },
          logs: {
            include: {
              exercise: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      });

      if (!session) {
        throw new Error("Training session not found");
      }

      return session;
    }),
});

