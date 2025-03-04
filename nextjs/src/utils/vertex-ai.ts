import { FinishReason, VertexAI } from "@google-cloud/vertexai";
import { env } from "../env.js";
import { EXAMPLE_README } from "./mock-ai-responses";

// Flags for testing - set to true to use mock responses
export const USE_MOCK = {
  ai: env.USE_MOCK_RESPONSES === "true", // Use mock AI responses instead of calling Vertex AI
  repoPacker: env.USE_MOCK_RESPONSES === "true", // Skip repoPacker and use mock repository content
} as const;

const authOptions = {
  credentials: {
    client_email: env.GOOGLE_CLIENT_EMAIL,
    private_key: env.GOOGLE_PRIVATE_KEY,
  },
};

// Initialize Vertex with your Cloud project and location
const vertex_ai = new VertexAI({
  project: env.GOOGLE_CLOUD_PROJECT_ID,
  location: env.GOOGLE_CLOUD_LOCATION,
  googleAuthOptions: authOptions,
});

// Select a model
const model = vertex_ai.preview.getGenerativeModel({
  model: "gemini-2.0-flash-001",
  generationConfig: {
    maxOutputTokens: 8192,
    temperature: 0.4,
    topP: 0.8,
    topK: 40,
  },
});

export type GenerateReadmeResponse = {
  readme: string;
  repoPackerOutput: string;
};

export type GenerateArchitectureResponse = {
  diagram: string;
  repoPackerOutput: string;
};

export type FileData = {
  name: string;
  content: string;
  type: string;
};

export async function* generateReadmeWithAIStream(
  repoContent: string,
  templateContent: string,
  additionalContext: string,
  repoUrl: string,
) {
  if (env.USE_MOCK_RESPONSES === "true") {
    await new Promise((resolve) => setTimeout(resolve, 300));
    // Stream mock response in larger chunks to be more efficient
    const mockResponse = EXAMPLE_README;
    const chunkSize = 100;
    for (let i = 0; i < mockResponse.length; i += chunkSize) {
      yield mockResponse.slice(i, i + chunkSize);
    }
    return;
  }

  try {
    const readmePrompt = `
      <repository contents>
      ${repoContent}
      </repository contents>

      <template content>
      ${templateContent}
      </template content>

      <repository url>
      ${repoUrl}
      </repository url>

      <additional instructions provided by the user>
      ${additionalContext}
      </additional instructions provided by the user>

      You are an expert technical writer tasked with creating a comprehensive README.md file for a GitHub repository.

      CRITICAL REQUIREMENTS:
      - Follow the template structure exactly
      - If the project's README contains meaningful information like screenshots, diagrams, etc., include them somewhere in the generated README
      - Use this as a placeholder for logos unless the logo was provided by the user or is from the existing README: https://github.com/user-attachments/assets/0ae1b6d5-1a62-4b41-b2c7-c595a0460497
      - Use this as a placeholder for videos unless the video was provided by the user or is from the existing README: https://github.com/user-attachments/assets/f45c9ee9-ad2f-40f4-bb60-e9bbd1472c45
      - Use this as a placeholder for images unless the image was provided by the user or is from the existing README: https://github.com/user-attachments/assets/721b7fb3-e480-4809-9023-fd48b82b1f8c
      - Keep any HTML tags, markdown comments, and attributes from the template
      - Carefully analyze the repository contents to accurately describe the project
      - WRAP YOUR RESPONSE IN MD TAGS BY STARTING THE RESPONSE WITH "\`\`\`md" AND ENDING WITH "\`\`\`"

      Analyze the repository contents. Then create a README.md file, taking into account any additional instructions provided.

      Please respond with the README.md file immediately:
      `;

    const result = await model.generateContentStream(readmePrompt);

    let firstChunkBuffer = "";
    let isFirstChunk = true;

    for await (const chunk of result.stream) {
      let text = chunk.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        if (isFirstChunk && firstChunkBuffer.length < 100) {
          firstChunkBuffer += text;
          continue;
        }

        if (isFirstChunk) {
          isFirstChunk = false;
          firstChunkBuffer = firstChunkBuffer.replace(/^<md\n?/, "");
          firstChunkBuffer = firstChunkBuffer.replace(/^```md\n?/g, "");
          yield firstChunkBuffer;
        }

        if (chunk.candidates?.[0]?.finishReason === FinishReason.STOP) {
          text = text.replace(/```\n?$/g, "");
        }

        yield text;
      }
    }
  } catch (error) {
    console.error("Error generating README with Vertex AI:", error);
    throw error;
  }
}
