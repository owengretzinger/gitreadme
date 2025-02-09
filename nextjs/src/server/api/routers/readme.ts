import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import {
  generateReadmeWithAIStream,
} from "~/utils/vertex-ai";
import { packRepository } from "~/utils/api-client";

// Define a schema for file data
const FileDataSchema = z.object({
  name: z.string(),
  content: z.string(),
  type: z.string(),
});

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
    .mutation(async function* ({ input }) {
      console.log("Starting streaming README generation for:", input.repoUrl);
      const startTime = performance.now();

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
          yield "AI:" + chunk;
        }

        const endTime = performance.now();
        console.log(
          `Total README generation process took ${(endTime - startTime).toFixed(2)}ms`,
        );
      } catch (error) {
        console.error("Error in streaming README generation:", error);
        throw error;
      }
    }),
});
