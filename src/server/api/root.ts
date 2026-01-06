import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

import { exerciseRouter } from "~/server/api/routers/exercise";
import { logRouter } from "~/server/api/routers/log";
import { trainingSessionRouter } from "~/server/api/routers/trainingSession";
import { userRouter } from "~/server/api/routers/user";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  user: userRouter,
  trainingSession: trainingSessionRouter,
  exercise: exerciseRouter,
  log: logRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 */
export const createCaller = createCallerFactory(appRouter);
