import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { generateReadmeWithAIStream } from "~/utils/vertex-ai";
import { packRepository } from "~/utils/api-client";
import { generatedReadmes } from "~/server/db/schema";
import { and, eq } from "drizzle-orm";
import { incrementRateLimit, refundRateLimit } from "../rate-limit";
import {
  createServerError,
  createTokenLimitError,
  isTokenLimitError,
} from "~/types/errors";
import { checkRateLimit } from "../rate-limit";

// Define a schema for file data
const FileDataSchema = z.object({
  name: z.string(),
  content: z.string(),
  type: z.string(),
});

export const readmeRouter = createTRPCRouter({
  getRateLimit: publicProcedure.query(async ({ ctx }) => {
    const ipAddress =
      ctx.headers.get("x-forwarded-for")?.split(",")[0] ??
      ctx.headers.get("x-real-ip") ??
      null;
    return checkRateLimit(ctx.db, ipAddress, ctx.session).then(
      (result) => result.info,
    );
  }),

  getNextVersion: publicProcedure
    .input(z.object({ repoPath: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const latestVersion = await ctx.db.query.generatedReadmes.findFirst({
        where: eq(generatedReadmes.repoPath, input.repoPath.toLowerCase()),
        orderBy: (generatedReadmes, { desc }) => [
          desc(generatedReadmes.version),
        ],
      });
      console.log("Latest version:", latestVersion?.version);
      return latestVersion ? latestVersion.version + 1 : 1;
    }),

  generateReadmeStream: publicProcedure
    .input(
      z.object({
        repoUrl: z.string().url(),
        templateContent: z.string(),
        additionalContext: z.string(),
        files: z.array(FileDataSchema).optional(),
        excludePatterns: z.array(z.string()).optional(),
        version: z.number(),
      }),
    )
    .mutation(async function* ({ ctx, input }) {
      const { session, db } = ctx;
      const ipAddress =
        ctx.headers.get("x-forwarded-for")?.split(",")[0] ??
        ctx.headers.get("x-real-ip") ??
        null;

      console.log("Starting streaming README generation for:", input.repoUrl);
      let generatedContent = "";

      try {
        void incrementRateLimit(ctx.db, ipAddress, ctx.session);

        console.log("Packing repository...");

        // Pack repository using Python server
        const repoPackerResult = await packRepository(
          input.repoUrl,
          undefined,
          undefined,
          input.excludePatterns,
        );

        if (!repoPackerResult.success) {
          // Refund rate limit for any packing errors
          await refundRateLimit(db, ipAddress, session);

          // Check if the error is a token limit exceeded error
          if (isTokenLimitError(repoPackerResult.error)) {
            const { files_analyzed, estimated_tokens, largest_files } =
              repoPackerResult.error;
            const tokenLimitError = createTokenLimitError(
              files_analyzed,
              estimated_tokens,
              largest_files,
            );
            yield "ERROR:" + JSON.stringify(tokenLimitError);
            return;
          }

          yield "ERROR:" + JSON.stringify(repoPackerResult.error);
          return;
        }

        yield "DONE_PACKING";

        // Generate README using Vertex AI with streaming
        console.log("Generating content with Vertex AI...");
        const stream = generateReadmeWithAIStream(
          repoPackerResult.content,
          input.templateContent,
          input.additionalContext,
          input.files,
        );

        for await (const chunk of stream) {
          generatedContent += chunk;
          yield "AI:" + chunk;
        }

        // Store the generated README in the database
        await db.insert(generatedReadmes).values({
          repoPath: new URL(input.repoUrl).pathname.replace(/^\//, "").toLowerCase(),
          version: input.version,
          content: generatedContent,
          userId: session?.user.id,
        });

        yield "DONE";
        return;
      } catch (error) {
        // Refund rate limit for any unhandled errors
        await refundRateLimit(db, ipAddress, session);

        if (error instanceof Error) {
          yield "ERROR:" + JSON.stringify(createServerError(error.message));
        } else {
          yield "ERROR:" +
            JSON.stringify(
              createServerError("Failed to stream README content"),
            );
        }
        return;
      }
    }),

  getByRepoPath: publicProcedure
    .input(
      z.object({
        repoPath: z.string(),
        version: z.number().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const normalizedRepoPath = input.repoPath.toLowerCase();
      const readme = await ctx.db.query.generatedReadmes.findFirst({
        where: input.version
          ? and(
              eq(generatedReadmes.repoPath, normalizedRepoPath),
              eq(generatedReadmes.version, input.version),
            )
          : eq(generatedReadmes.repoPath, normalizedRepoPath),
        orderBy: !input.version
          ? (generatedReadmes, { desc }) => [desc(generatedReadmes.version)]
          : undefined,
      });
      return readme ?? null;
    }),

  getMostRecentVersion: publicProcedure
    .input(z.object({ repoPath: z.string() }))
    .query(async ({ input, ctx }) => {
      const readme = await ctx.db.query.generatedReadmes.findFirst({
        where: eq(generatedReadmes.repoPath, input.repoPath.toLowerCase()),
        orderBy: (generatedReadmes, { desc }) => [
          desc(generatedReadmes.version),
        ],
      });
      return readme ?? null;
    }),

  getRecentReadmes: publicProcedure.query(async ({ ctx }) => {
    const readmes = await ctx.db.query.generatedReadmes.findMany({
      where: eq(generatedReadmes.userId, ctx.session?.user.id ?? ""),
      orderBy: (generatedReadmes, { desc }) => [
        desc(generatedReadmes.createdAt),
      ],
      limit: 6,
    });
    return readmes;
  }),
});
