import { createTRPCRouter, protectedProcedure } from "../trpc";
import { desc, eq, and } from "drizzle-orm";
import { generatedReadmes, generationLimits } from "~/server/db/schema";
import { z } from "zod";

export const dashboardRouter = createTRPCRouter({
  getUserData: protectedProcedure.query(async ({ ctx }) => {
    const [readmes, usageData] = await Promise.all([
      // Get user's generated READMEs
      ctx.db.query.generatedReadmes.findMany({
        where: eq(generatedReadmes.userId, ctx.session.user.id),
        orderBy: [desc(generatedReadmes.updatedAt)],
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
        lastGenerated: readmes[0]?.updatedAt ?? null,
      },
    };
  }),

  deleteReadme: protectedProcedure
    .input(z.object({
      id: z.string(),
      repoPath: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(generatedReadmes)
        .where(
          and(
            eq(generatedReadmes.id, input.id),
            eq(generatedReadmes.userId, ctx.session.user.id)
          )
        );
      return { success: true };
    }),
});
