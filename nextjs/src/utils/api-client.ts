import { type PackRepositoryResponse } from "~/types/api";

const PYTHON_SERVER_URL = "http://127.0.0.1:5000";

export async function packRepository(
  repoUrl: string,
  maxFileSize?: number,
  maxTokens?: number,
  excludePatterns?: string[]
): Promise<PackRepositoryResponse> {
  try {
    const response = await fetch(`${PYTHON_SERVER_URL}/api/pack`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        repo_url: repoUrl,
        max_file_size: maxFileSize ?? 10485760,
        max_tokens: maxTokens ?? 100000,
        exclude_patterns: excludePatterns ?? [],
      }),
    });

    const data = await response.json();
    console.log("Pack repository response:", data);
    
    if (data.error) {
      return {
        success: false,
        error: data.error,
        files_analyzed: data.files_analyzed,
        estimated_tokens: data.estimated_tokens,
        largest_files: data.largest_files,
      };
    }

    return {
      success: true,
      files_analyzed: data.files_analyzed,
      estimated_tokens: data.estimated_tokens,
      content: data.content,
    };
  } catch (error) {
    console.error("Failed to connect to Python server:", error);
    return {
      success: false,
      error: "Failed to connect to Python server",
    };
  }
} 