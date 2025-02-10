import { createTRPCRouter, protectedProcedure } from "../trpc";
import { desc, eq } from "drizzle-orm";
import { generatedReadmes, generationLimits } from "~/server/db/schema";

export const dashboardRouter = createTRPCRouter({
  getUserData: protectedProcedure.query(async ({ ctx }) => {
    const [readmes, usageData] = await Promise.all([
      // Get user's generated READMEs
      ctx.db.query.generatedReadmes.findMany({
        where: eq(generatedReadmes.userId, ctx.session.user.id),
        orderBy: [desc(generatedReadmes.createdAt)],
      }),
      // Get user's generation limits/usage
      ctx.db.query.generationLimits.findFirst({
        where: eq(generationLimits.userId, ctx.session.user.id),
      }),
    ]);

    return {
      readmes,
      usageData: {
        generationsToday: usageData?.count ?? 0,
        lastGenerated: readmes[0]?.createdAt ?? null,
      },
    };
  }),
});
