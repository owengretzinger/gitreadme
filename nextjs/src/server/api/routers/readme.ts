import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { generateReadmeWithAI } from "~/utils/vertex-ai";
import { templates } from "~/components/readme-templates/readme-templates";
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
        templateId: z.string(),
        additionalContext: z.string(),
        files: z.array(FileDataSchema).optional(),
        excludePatterns: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input }): Promise<GenerateReadmeResponse> => {
      console.log("Starting README generation for:", input.repoUrl);
      const startTime = performance.now();

      try {
        // Find the template content
        const template = templates.find((t) => t.id === input.templateId);
        if (!template) {
          return {
            success: false,
            error: `Template with ID "${input.templateId}" not found`,
          };
        }

        // Pack repository using Python server
        const repomixResult = await packRepository(
          input.repoUrl,
          undefined,
          undefined,
          input.excludePatterns
        );
        if (!repomixResult.success) {
          return {
            success: false,
            error: repomixResult.error,
            largestFiles: repomixResult.largest_files,
          };
        }

        // Generate README using Vertex AI
        console.log("Generating content with Vertex AI...");
        const result = await generateReadmeWithAI(
          repomixResult.content,
          template.content,
          input.additionalContext,
          input.files
        );

        const endTime = performance.now();
        console.log(`Total README generation process took ${(endTime - startTime).toFixed(2)}ms`);

        return {
          success: true,
          readme: result.readme,
          repomixOutput: repomixResult.content,
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
