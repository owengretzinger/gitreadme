import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import {
  generateReadmeWithAIStream,
} from "~/utils/vertex-ai";
import { packRepository } from "~/utils/api-client";
import { generatedReadmes } from "~/server/db/schema";
import { and, eq } from "drizzle-orm";
import { getCurrentRateLimit } from "../rate-limit";
import { createServerError, createTokenLimitError, isTokenLimitError } from "~/types/errors";
import { checkRateLimit, incrementRateLimit, decrementRateLimit } from "../rate-limit";
import { createRateLimitError } from "../rate-limit";

// Define a schema for file data
const FileDataSchema = z.object({
  name: z.string(),
  content: z.string(),
  type: z.string(),
});

export const readmeRouter = createTRPCRouter({
  getRateLimit: publicProcedure.query(async ({ ctx }) => {
    const ipAddress = ctx.headers.get("x-forwarded-for")?.split(",")[0] ?? ctx.headers.get("x-real-ip");
    return getCurrentRateLimit(ctx.db, ipAddress, ctx.session);
  }),

  generateReadmeStream: publicProcedure
    .input(
      z.object({
        repoUrl: z.string().url(),
        templateContent: z.string(),
        additionalContext: z.string(),
        files: z.array(FileDataSchema).optional(),
        excludePatterns: z.array(z.string()).optional(),
      }),
    )
    .mutation(async function* ({ ctx, input }) {
      const { session, db } = ctx;
      const ipAddress = ctx.headers.get("x-forwarded-for")?.split(",")[0] ?? ctx.headers.get("x-real-ip") ?? null;

      // Check rate limit first
      const rateLimitResult = await checkRateLimit(db, ipAddress, session);
      if (!rateLimitResult.allowed) {
        yield "ERROR:" + JSON.stringify(createRateLimitError(rateLimitResult.info, "Rate limit exceeded"));
        return;
      }

      // Increment rate limit counter
      await incrementRateLimit(db, ipAddress, session);
      yield "RATE_LIMIT:" + JSON.stringify(rateLimitResult.info);

      console.log("Starting streaming README generation for:", input.repoUrl);
      const startTime = performance.now();
      let generatedContent = "";

      try {
        console.log("Packing repository...");

        // Pack repository using Python server
        const repoPackerResult = await packRepository(
          input.repoUrl,
          undefined,
          undefined,
          input.excludePatterns,
        );

        if (!repoPackerResult.success) {
          console.log("repoPackerResult.error", repoPackerResult.error);
          // Check if the error is a token limit exceeded error
          if (isTokenLimitError(repoPackerResult.error)) {
            const { files_analyzed, estimated_tokens, largest_files } = repoPackerResult.error;
            const tokenLimitError = createTokenLimitError(
              files_analyzed,
              estimated_tokens,
              largest_files
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

        // Get the next version number for this repo
        const repoPath = new URL(input.repoUrl).pathname.replace(/^\//, "");
        const latestVersion = await db.query.generatedReadmes.findFirst({
          where: eq(generatedReadmes.repoPath, repoPath),
          orderBy: (generatedReadmes, { desc }) => [desc(generatedReadmes.version)],
        });
        const nextVersion = latestVersion ? latestVersion.version + 1 : 1;

        // Store the generated README in the database
        await db.insert(generatedReadmes).values({
          repoPath,
          version: nextVersion,
          content: generatedContent,
          userId: session?.user.id,
        });

        const endTime = performance.now();
        console.log(
          `Total README generation process took ${(endTime - startTime).toFixed(2)}ms`,
        );

        return;
      } catch (error) {
        // Decrement rate limit since generation failed
        await decrementRateLimit(db, ipAddress, session);
        
        if (error instanceof Error) {
          yield "ERROR:" + JSON.stringify(createServerError(error.message));
        } else {
          yield "ERROR:" + JSON.stringify(createServerError("Failed to stream README content"));
        }
        return;
      }
    }),

  getByRepoPath: publicProcedure
    .input(z.object({ 
      repoPath: z.string(),
      version: z.number().optional(),
    }))
    .query(async ({ input, ctx }) => {
      const readme = await ctx.db.query.generatedReadmes.findFirst({
        where: input.version 
          ? and(
              eq(generatedReadmes.repoPath, input.repoPath),
              eq(generatedReadmes.version, input.version)
            )
          : eq(generatedReadmes.repoPath, input.repoPath),
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
        where: eq(generatedReadmes.repoPath, input.repoPath),
        orderBy: (generatedReadmes, { desc }) => [desc(generatedReadmes.version)],
      });
      return readme ?? null;
    }),

  getNextVersion: publicProcedure
    .input(z.object({ repoPath: z.string() }))
    .query(async ({ input, ctx }) => {
      const latestVersion = await ctx.db.query.generatedReadmes.findFirst({
        where: eq(generatedReadmes.repoPath, input.repoPath),
        orderBy: (generatedReadmes, { desc }) => [desc(generatedReadmes.version)],
      });
      return latestVersion ? latestVersion.version + 1 : 1;
    }),
});
