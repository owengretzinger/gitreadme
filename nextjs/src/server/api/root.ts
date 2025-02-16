import { createTRPCRouter } from "~/server/api/trpc";
import { readmeRouter } from "./routers/readme";
import { createCallerFactory } from "~/server/api/trpc";
// import { architectureRouter } from "~/server/api/routers/architecture";
import { dashboardRouter } from "./routers/dashboard";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  readme: readmeRouter,
  // architecture: architectureRouter,
  dashboard: dashboardRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
