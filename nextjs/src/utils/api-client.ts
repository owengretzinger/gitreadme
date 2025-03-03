import { env } from "~/env";
import {
  type ApiErrorResponse,
  createServerError,
  createTokenLimitError,
  createUnauthorizedError,
  createRepositoryAccessError,
  createRepositoryNotFoundError,
  createConnectionError,
} from "~/types/errors";

interface ApiResponse {
  error?: string;
  files_analyzed?: number;
  estimated_tokens?: number;
  content?: string;
  largest_files?: Array<{
    path: string;
    tokens: number;
  }>;
}

interface TokenLimitServerResponse {
  error: "Token limit exceeded";
  files_analyzed: number;
  estimated_tokens: number;
  largest_files: Array<{
    path: string;
    tokens: number;
  }>;
}

interface FileSize {
  path: string;
  tokens: number;
}

function isFileSize(value: unknown): value is FileSize {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as { path: string }).path === "string" &&
    typeof (value as { tokens: number }).tokens === "number"
  );
}

function isTokenLimitServerResponse(
  value: unknown,
): value is TokenLimitServerResponse {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Partial<TokenLimitServerResponse>;
  return (
    v.error === "Token limit exceeded" &&
    typeof v.files_analyzed === "number" &&
    typeof v.estimated_tokens === "number" &&
    Array.isArray(v.largest_files) &&
    v.largest_files?.every(isFileSize)
  );
}

type PackRepositorySuccessResponse = {
  success: true;
  files_analyzed: number;
  estimated_tokens: number;
  content: string;
};

type PackRepositoryErrorResponse = {
  success: false;
  error: ApiErrorResponse;
};

type PackRepositoryResponse =
  | PackRepositorySuccessResponse
  | PackRepositoryErrorResponse;

function isApiResponse(response: unknown): response is ApiResponse {
  if (typeof response !== "object" || response === null) return false;
  const r = response as Record<string, unknown>;
  return (
    (typeof r.error === "string" || typeof r.error === "undefined") &&
    (typeof r.files_analyzed === "number" ||
      typeof r.files_analyzed === "undefined") &&
    (typeof r.estimated_tokens === "number" ||
      typeof r.estimated_tokens === "undefined") &&
    (typeof r.content === "string" || typeof r.content === "undefined") &&
    (Array.isArray(r.largest_files) || typeof r.largest_files === "undefined")
  );
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

      const errorResponse: PackRepositoryErrorResponse = {
        success: false,
        error: createServerError("Rate limit exceeded", response.status, {
          limit: limit ?? "Unknown limit",
          retryAfter: retryAfter ?? undefined,
        }),
      };
      return errorResponse;
    }

    // Handle unauthorized
    if (response.status === 401) {
      const errorResponse: PackRepositoryErrorResponse = {
        success: false,
        error: createUnauthorizedError(),
      };
      return errorResponse;
    }

    // Handle forbidden (likely GitHub access issue)
    if (response.status === 403) {
      try {
        // Try to parse the response body to see if it's actually from our repo-packer service
        const responseText = await response.text();
        
        // Check if response is empty or very short, which is likely from a misconfigured backend
        if (!responseText || responseText.length < 10) {
          const errorResponse: PackRepositoryErrorResponse = {
            success: false,
            error: createConnectionError(),
          };
          return errorResponse;
        }
        
        // If we have a proper response body, it's likely a genuine repo access error
        const errorResponse: PackRepositoryErrorResponse = {
          success: false,
          error: createRepositoryAccessError(),
        };
        return errorResponse;
      } catch {
        // If we can't parse the response, assume it's a connection error
        const errorResponse: PackRepositoryErrorResponse = {
          success: false, 
          error: createConnectionError(),
        };
        return errorResponse;
      }
    }

    // Handle not found
    if (response.status === 404) {
      const errorResponse: PackRepositoryErrorResponse = {
        success: false,
        error: createRepositoryNotFoundError(),
      };
      return errorResponse;
    }

    // Handle non-200 responses
    if (!response.ok) {
      try {
        const errorText = await response.text();
        try {
          // Try to parse the error text as JSON
          const jsonError: unknown = JSON.parse(errorText);
          if (isTokenLimitServerResponse(jsonError)) {
            const errorResponse: PackRepositoryErrorResponse = {
              success: false,
              error: createTokenLimitError(
                jsonError.files_analyzed,
                jsonError.estimated_tokens,
                jsonError.largest_files,
              ),
            };
            return errorResponse;
          }

          // Handle timeout errors specifically
          if (
            typeof jsonError === "object" &&
            jsonError !== null &&
            "type" in jsonError &&
            jsonError.type === "AsyncTimeoutError" &&
            "error" in jsonError &&
            typeof jsonError.error === "string" &&
            jsonError.error.includes("Operation timed out")
          ) {
            const errorResponse: PackRepositoryErrorResponse = {
              success: false,
              error: createServerError(
                "The repository is taking too long to process. This usually happens with a poor network connection or a large repository. Try excluding more files or try again later.",
                response.status,
              ),
            };
            return errorResponse;
          }
        } catch {
          // If JSON parsing fails, treat as regular server error
        }
        const errorResponse: PackRepositoryErrorResponse = {
          success: false,
          error: createServerError(
            `Server error (${response.status}): ${errorText}`,
            response.status,
          ),
        };
        return errorResponse;
      } catch {
        const errorResponse: PackRepositoryErrorResponse = {
          success: false,
          error: createServerError(
            `Server error (${response.status})`,
            response.status,
          ),
        };
        return errorResponse;
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
      const errorResponse: PackRepositoryErrorResponse = {
        success: false,
        error: createServerError("Invalid response from server"),
      };
      return errorResponse;
    }

    if (data.error) {
      // Handle token limit exceeded error
      if (data.error === "Token limit exceeded" && data.largest_files) {
        const errorResponse: PackRepositoryErrorResponse = {
          success: false,
          error: createTokenLimitError(
            data.files_analyzed!,
            data.estimated_tokens!,
            data.largest_files,
          ),
        };
        return errorResponse;
      }

      // Handle other errors
      const errorResponse: PackRepositoryErrorResponse = {
        success: false,
        error: createServerError(data.error),
      };
      return errorResponse;
    }

    // Handle successful response
    const successResponse: PackRepositorySuccessResponse = {
      success: true,
      files_analyzed: data.files_analyzed!,
      estimated_tokens: data.estimated_tokens!,
      content: data.content!,
    };
    return successResponse;
  } catch (error) {
    console.error("Failed to connect to server:", error);
    const errorResponse: PackRepositoryErrorResponse = {
      success: false,
      error: createConnectionError(),
    };
    return errorResponse;
  }
}
