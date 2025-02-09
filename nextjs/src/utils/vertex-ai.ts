import { VertexAI } from "@google-cloud/vertexai";
import { env } from "../env.js";
import {
  MOCK_REPO_CONTENT,
  EXAMPLE_DIAGRAM,
  EXAMPLE_README,
} from "./mock-ai-responses";

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
    maxOutputTokens: 2048,
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
  files?: FileData[],
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
    // Process uploaded files
    const fileContents =
      files
        ?.map(
          (file) => `File: ${file.name} (${file.type})\n${file.content}\n---\n`,
        )
        .join("\n") ?? "";

    const readmePrompt = `
      <repository contents>
      ${repoContent}
      </repository contents>

      <file contents uploaded by user>
      ${fileContents}
      </file contents uploaded by user>

      <template content>
      ${templateContent}
      </template content>

      <additional instructions>
      ${additionalContext}
      </additional instructions>

      You are an expert technical writer tasked with creating a comprehensive README.md file for a GitHub repository.

      CRITICAL REQUIREMENTS:
      - Follow the template structure exactly
      - YOU MUST NOT wrap your entire response in \`\`\`md tags (not markdown or any other variant). FAILURE TO FOLLOW THIS INSTRUCTION WILL RESULT IN FAILURE.
      - Replace logos with this placeholder: https://github.com/user-attachments/assets/0ae1b6d5-1a62-4b41-b2c7-c595a0460497
      - Replace demo videos with this placeholder: https://github.com/user-attachments/assets/3b6baea2-cb25-4670-86b8-094d69d2bf83
      - Replace images with this placeholder: https://github.com/user-attachments/assets/79d3c0f6-21b6-413b-9f30-5117c6b60e7d
      - Keep any HTML tags and attributes from the template
      - Carefully analyze the repository contents to accurately describe the project

      Analyze the repository contents and the file contents uploaded by the user. Then create a README.md file, taking into account any additional instructions provided. Start your response with "#" to indicate the start of the README.md file.
      `;

    const result = await model.generateContentStream(readmePrompt);

    for await (const chunk of result.stream) {
      const text = chunk.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        yield text;
      }
    }
  } catch (error) {
    console.error("Error generating README with Vertex AI:", error);
    throw error;
  }
}

export async function generateArchitectureDiagram(
  repoContent: string,
): Promise<GenerateArchitectureResponse> {
  if (true) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return {
      diagram: EXAMPLE_DIAGRAM,
      repoPackerOutput: USE_MOCK.repoPacker ? MOCK_REPO_CONTENT : repoContent,
    };
  }

  //   try {
  //     const diagramPrompt = `You are a software architect tasked with creating a high-level Mermaid.js diagram that visualizes the core architecture of a GitHub repository.

  // CRITICAL FORMATTING REQUIREMENTS:
  // - Structure your response in two parts:
  //   1. First, wrap your analysis in <thinking> tags
  //   2. Then, wrap your Mermaid diagram in <diagram> tags
  // - Inside the <thinking> tags:
  //   - List all major components and technologies identified
  //   - Explain key relationships and data flows
  //   - Describe any logical groupings you plan to make
  // - Inside the <diagram> tags:
  //   - Start DIRECTLY with "graph TD"
  //   - NO backticks or Mermaid tags
  //   - Just the raw Mermaid.js code

  // DIAGRAM CONTENT REQUIREMENTS:
  // - Focus ONLY on the main components and their relationships
  // - Keep the diagram simple and clear (max 10-15 nodes)
  // - Show the high-level flow, not implementation details
  // - Group related components into subgraphs
  // - Avoid showing individual functions or files

  // TEMPLATE RULES - YOU MUST FOLLOW THESE EXACTLY:
  // 1. First line inside <diagram> MUST be "graph TD"
  // 2. Node IDs:
  //    - ONLY use simple letters (A, B, C) or words (Frontend, Backend)
  //    - NO special characters, dots, or spaces in IDs
  //    - Example: Frontend --> Backend (CORRECT)
  //    - Example: frontend.api --> db (INCORRECT)
  // 3. Node Labels:
  //    - ALL text with special characters MUST be in square brackets
  //    - Example: A[Authentication API] --> B[Database]
  // 4. Arrows and Formatting:
  //    - ONLY use --> for connections
  //    - Each connection MUST be on its own line
  //    - NO multiple arrows on the same line
  //    - NO spaces before or after arrows
  //    - BAD: A --> B    C --> D
  //    - GOOD: A --> B
  //          C --> D
  // 5. Subgraphs:
  //    - MUST follow this exact format:
  //      subgraph Name
  //          content
  //      end
  //    - NO variations allowed
  //    - Each subgraph must start on a new line

  // Example of correct format:
  // <thinking>
  // Components identified:
  // - Frontend: Next.js application
  // - Backend API: Express server
  // - Database: PostgreSQL
  // - Authentication: JWT-based auth service

  // Key relationships:
  // - Frontend makes API calls to backend
  // - Backend handles auth and data storage
  // - Database stores user and application data

  // Planned groupings:
  // - Frontend layer
  // - Backend services
  // - Data storage
  // </thinking>

  // <diagram>
  // graph TD
  // A[Frontend App]-->B[API Gateway]
  // subgraph Backend
  //     B-->C[Auth Service]
  //     C-->D[Database]
  // end
  // </diagram>

  // Based on the repository content, show:
  // 1. Core system components (Frontend, Backend, Database, etc.)
  // 2. Main data flow between components
  // 3. Key external services and integrations
  // 4. Logical groupings using subgraphs

  // HERE IS THE REPOSITORY CONTENT:

  // ${repoContent}

  // Remember: Structure your response with <thinking> tags followed by <diagram> tags. Inside <diagram>, start DIRECTLY with "graph TD" - NO BACKTICKS, NO EXTRA TEXT. Make a clean diagram with max 5 nodes per component. PREFER SIMPLER DIAGRAMS. AND KEEP IT HIGH LEVEL HIGHLIGHTING THE TECHNOLOGIES, NOT INDIVIDUAL ROUTES.`;

  //     const result = await model.generateContent(diagramPrompt);
  //     const response =
  //       result.response?.candidates?.[0]?.content?.parts?.[0]?.text;

  //     if (!response) {
  //       throw new Error("No response from AI model");
  //     }

  //     // Extract just the diagram part using RegExp.exec()
  //     const diagramRegex = /<diagram>([\s\S]*?)<\/diagram>/;
  //     const diagramMatch = diagramRegex.exec(response);
  //     let diagram = diagramMatch?.[1]?.trim() ?? response;

  //     // Clean up the diagram by removing any Mermaid markdown tags
  //     diagram = diagram
  //       .replace(/```mermaid\n?/g, "") // Remove opening mermaid tag
  //       .replace(/```\n?/g, "") // Remove closing tag
  //       .trim(); // Remove any extra whitespace

  //     return {
  //       diagram,
  //       repoPackerOutput: repoContent,
  //     };
  //   } catch (error) {
  //     console.error("Error generating diagram with Vertex AI:", error);
  //     throw error;
  //   }
}
