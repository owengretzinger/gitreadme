import { type PackRepositoryResponse } from "~/types/api";
import { env } from "~/env";

export async function packRepository(
  repoUrl: string,
  maxFileSize?: number,
  maxTokens?: number,
  excludePatterns?: string[]
): Promise<PackRepositoryResponse> {
  try {
    const response = await fetch(`${env.REPO_PACKER_URL}/api/pack`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${env.REPO_PACKER_TOKEN}`,
      },
      body: JSON.stringify({
        repo_url: repoUrl,
        max_file_size: maxFileSize ?? 10485760,
        max_tokens: maxTokens ?? 500000,
        exclude_patterns: excludePatterns ?? [],
      }),
    });

    // Handle rate limiting
    if (response.status === 429) {
      const retryAfter = response.headers.get("Retry-After");
      const text = await response.text();
      const match = text.match(/(\d+) per (\d+) (minute|second)/);
      const limit = match ? match[0] : undefined;
      
      return {
        success: false,
        error: "Rate limit exceeded",
        rateLimitInfo: {
          limit: limit ?? "Unknown limit",
          reset: retryAfter ?? undefined,
        },
      };
    }

    // Handle unauthorized
    if (response.status === 401) {
      return {
        success: false,
        error: "Unauthorized - check your API token",
      };
    }

    // Handle forbidden (likely GitHub access issue)
    if (response.status === 403) {
      return {
        success: false,
        error: "Cannot access repository. Make sure the repository exists and is public.",
      };
    }

    // Handle not found
    if (response.status === 404) {
      return {
        success: false,
        error: "Repository not found. Please check the URL and try again.",
      };
    }

    // Handle non-200 responses
    if (!response.ok) {
      try {
        const errorText = await response.text();
        return {
          success: false,
          error: `Server error (${response.status}): ${errorText}`,
        };
      } catch {
        return {
          success: false,
          error: `Server error (${response.status})`,
        };
      }
    }

    let data;
    try {
      data = await response.json();
    } catch (error) {
      console.error("Failed to parse JSON response:", error);
      return {
        success: false,
        error: "Invalid response from server",
      };
    }

    console.log("Pack repository response:", data);
    
    if (data.error) {
      // Handle token limit exceeded error
      if (data.error === "Token limit exceeded" && data.largest_files) {
        return {
          success: false,
          error: data.error,
          files_analyzed: data.files_analyzed,
          estimated_tokens: data.estimated_tokens,
          largest_files: data.largest_files,
        };
      }
      
      // Handle other errors
      return {
        success: false,
        error: data.error,
        files_analyzed: data.files_analyzed,
        estimated_tokens: data.estimated_tokens,
      };
    }

    // Handle successful response
    return {
      success: true,
      files_analyzed: data.files_analyzed,
      estimated_tokens: data.estimated_tokens,
      content: data.content,
    };
  } catch (error) {
    console.error("Failed to connect to server:", error);
    return {
      success: false,
      error: "Failed to connect to server",
    };
  }
} 