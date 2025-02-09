import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import {
  generateReadmeWithAIStream,
} from "~/utils/vertex-ai";
import { packRepository } from "~/utils/api-client";
import { generatedReadmes } from "~/server/db/schema";
import { and, eq } from "drizzle-orm";

// Define a schema for file data
const FileDataSchema = z.object({
  name: z.string(),
  content: z.string(),
  type: z.string(),
});

interface TokenLimitErrorResponse {
  error: string;
  estimated_tokens: number;
  files_analyzed: number;
  largest_files: Array<{ path: string; size_kb: number }>;
}

export const readmeRouter = createTRPCRouter({
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
    .mutation(async function* ({ input, ctx }) {
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
          // Check if the error is a token limit exceeded error
          try {
            // Remove "Server error (400): " prefix if it exists
            const errorString = repoPackerResult.error.replace("Server error (400): ", "");
            const errorData = JSON.parse(errorString) as TokenLimitErrorResponse;
            if (errorData.error.includes("Token limit exceeded")) {
              console.log("Token limit exceeded, sending error details to client");
              yield "ERROR:TOKEN_LIMIT_EXCEEDED:" + JSON.stringify(errorData);
              return;
            }
          } catch (e) {
            console.error("Failed to parse error response:", e);
          }
          
          console.error("Repository packing failed:", repoPackerResult.error);
          throw new Error(
            repoPackerResult.error || "Failed to pack repository",
          );
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
        const latestVersion = await ctx.db.query.generatedReadmes.findFirst({
          where: eq(generatedReadmes.repoPath, repoPath),
          orderBy: (generatedReadmes, { desc }) => [desc(generatedReadmes.version)],
        });
        const nextVersion = latestVersion ? latestVersion.version + 1 : 1;

        // Store the generated README in the database
        await ctx.db.insert(generatedReadmes).values({
          repoPath,
          version: nextVersion,
          content: generatedContent,
          userId: ctx.session?.user.id,
        });

        const endTime = performance.now();
        console.log(
          `Total README generation process took ${(endTime - startTime).toFixed(2)}ms`,
        );
      } catch (error) {
        console.error("Error in streaming README generation:", error);
        throw error;
      }
    }),

  getByRepoPath: publicProcedure
    .input(z.object({ 
      repoPath: z.string(),
      version: z.number().optional(),
    }))
    .query(async ({ input, ctx }) => {
      if (input.version) {
        // Get specific version
        const readme = await ctx.db.query.generatedReadmes.findFirst({
          where: and(
            eq(generatedReadmes.repoPath, input.repoPath),
            eq(generatedReadmes.version, input.version)
          ),
        });
        if (!readme) {
          return null;
        }
        return readme;
      } else {
        // Get latest version
        return await ctx.db.query.generatedReadmes.findFirst({
          where: eq(generatedReadmes.repoPath, input.repoPath),
          orderBy: (generatedReadmes, { desc }) => [desc(generatedReadmes.version)],
        });
      }
    }),

  getMostRecentVersion: publicProcedure
    .input(z.object({ repoPath: z.string() }))
    .query(async ({ input, ctx }) => {
      return await ctx.db.query.generatedReadmes.findFirst({
        where: eq(generatedReadmes.repoPath, input.repoPath),
        orderBy: (generatedReadmes, { desc }) => [desc(generatedReadmes.version)],
      });
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
