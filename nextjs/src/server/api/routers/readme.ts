import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { generateReadmeWithAI } from "~/utils/vertex-ai";
import { packRepository } from "~/utils/api-client";
import { type GenerateReadmeResponse } from "~/types/api";

// Define a schema for file data
const FileDataSchema = z.object({
  name: z.string(),
  content: z.string(),
  type: z.string(),
});

export const readmeRouter = createTRPCRouter({
  generateReadme: publicProcedure
    .input(
      z.object({
        repoUrl: z.string().url(),
        templateContent: z.string(),
        additionalContext: z.string(),
        files: z.array(FileDataSchema).optional(),
        excludePatterns: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input }): Promise<GenerateReadmeResponse> => {
      console.log("Starting README generation for:", input.repoUrl);
      const startTime = performance.now();

      try {
        console.log("Packing repository...");

        // Pack repository using Python server
        const repoPackerResult = await packRepository(
          input.repoUrl,
          undefined,
          undefined,
          input.excludePatterns
        );
        if (!repoPackerResult.success) {
          return {
            success: false,
            error: repoPackerResult.error,
            largestFiles: repoPackerResult.largest_files,
          };
        }

        // Generate README using Vertex AI
        console.log("Generating content with Vertex AI...");
        const result = await generateReadmeWithAI(
          repoPackerResult.content,
          input.templateContent,
          input.additionalContext,
          input.files
        );

        const endTime = performance.now();
        console.log(`Total README generation process took ${(endTime - startTime).toFixed(2)}ms`);

        return {
          success: true,
          readme: result.readme,
          repoPackerOutput: repoPackerResult.content,
        };
      } catch (error) {
        console.log("Error:", error);
        return {
          success: false,
          error: "An unexpected error occurred. Please try again later.",
        };
      }
    }),
});
