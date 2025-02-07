import { type PackRepositoryResponse } from "~/types/api";
import { env } from "~/env";

interface ApiResponse {
  error?: string;
  files_analyzed?: number;
  estimated_tokens?: number;
  largest_files?: Array<{ path: string; size_kb: number }>;
  content?: string;
}

function isApiResponse(obj: unknown): obj is ApiResponse {
  if (!obj || typeof obj !== "object") return false;
  
  const response = obj as Record<string, unknown>;
  
  // Check each property has the correct type if it exists
  if (response.error !== undefined && typeof response.error !== "string") return false;
  if (response.files_analyzed !== undefined && typeof response.files_analyzed !== "number") return false;
  if (response.estimated_tokens !== undefined && typeof response.estimated_tokens !== "number") return false;
  if (response.content !== undefined && typeof response.content !== "string") return false;
  
  // Check largest_files array if it exists
  if (response.largest_files !== undefined) {
    if (!Array.isArray(response.largest_files)) return false;
    for (const file of response.largest_files) {
      if (!file || typeof file !== "object") return false;
      const f = file as Record<string, unknown>;
      if (typeof f.path !== "string" || typeof f.size_kb !== "number") return false;
    }
  }
  
  return true;
}

export async function packRepository(
  repoUrl: string,
  maxFileSize?: number,
  maxTokens?: number,
  excludePatterns?: string[],
): Promise<PackRepositoryResponse> {
  try {
    const response = await fetch(`${env.REPO_PACKER_URL}/api/pack`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.REPO_PACKER_TOKEN}`,
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
      const regex = /(\d+) per (\d+) (minute|second)/;
      const match = regex.exec(text);
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
        error:
          "Cannot access repository. Make sure the repository exists and is public.",
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

    let data: ApiResponse;
    try {
      const jsonResponse: unknown = await response.json();
      
      if (!isApiResponse(jsonResponse)) {
        throw new Error("Invalid response shape");
      }
      data = jsonResponse;
    } catch (error) {
      console.error("Failed to parse JSON response:", error);
      return {
        success: false,
        error: "Invalid response from server",
      };
    }

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
      content: data.content ?? "",
    } as PackRepositoryResponse;
  } catch (error) {
    console.error("Failed to connect to server:", error);
    return {
      success: false,
      error: "Failed to connect to server",
    };
  }
}
