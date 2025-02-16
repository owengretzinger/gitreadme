// import { z } from "zod";
// import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
// import { generateArchitectureDiagram } from "~/utils/vertex-ai";
// import { packRepository } from "~/utils/api-client";
// import { type GenerateArchitectureResponse } from "~/types/api";

// export const architectureRouter = createTRPCRouter({
//   generateDiagram: publicProcedure
//     .input(
//       z.object({
//         repoUrl: z.string().url(),
//         excludePatterns: z.array(z.string()).optional(),
//       })
//     )
//     .mutation(async ({ input }): Promise<GenerateArchitectureResponse> => {
//       console.log(
//         "Starting architecture diagram generation for:",
//         input.repoUrl,
//       );

//       try {
//         // Pack repository using Python server
//         const repoPackerResult = await packRepository(
//           input.repoUrl,
//           undefined,
//           undefined,
//           input.excludePatterns
//         );
//         if (!repoPackerResult.success) {
//           return {
//             success: false,
//             error: repoPackerResult.error.message,
//             largestFiles: 'largest_files' in repoPackerResult.error ? repoPackerResult.error.largest_files : undefined,
//           };
//         }

//         // Generate diagram using Vertex AI
//         console.log("Generating content with Vertex AI...");
//         const result = await generateArchitectureDiagram(
//           repoPackerResult.content,
//         );

//         return {
//           success: true,
//           diagram: result.diagram,
//           repoPackerOutput: repoPackerResult.content,
//         };
//       } catch (error) {
//         console.log("Error:", error);
//         return {
//           success: false,
//           error: "An unexpected error occurred. Please try again later.",
//         };
//       }
//     }),
// });
