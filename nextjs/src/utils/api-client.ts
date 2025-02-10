import { env } from "~/env";
import {
  type ApiErrorResponse,
  createServerError,
  createTokenLimitError,
  createUnauthorizedError,
  createRepositoryAccessError,
  createRepositoryNotFoundError,
} from "~/types/errors";

interface ApiResponse {
  error?: string;
  files_analyzed?: number;
  estimated_tokens?: number;
  content?: string;
  largest_files?: Array<{
    path: string;
    size_kb: number;
  }>;
}

interface TokenLimitServerResponse {
  error: "Token limit exceeded";
  files_analyzed: number;
  estimated_tokens: number;
  largest_files: Array<{
    path: string;
    size_kb: number;
  }>;
}

interface FileSize {
  path: string;
  size_kb: number;
}

function isFileSize(value: unknown): value is FileSize {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as { path: string }).path === "string" &&
    typeof (value as { size_kb: number }).size_kb === "number"
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
      const errorResponse: PackRepositoryErrorResponse = {
        success: false,
        error: createRepositoryAccessError(),
      };
      return errorResponse;
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
      error: createServerError("Failed to connect to server"),
    };
    return errorResponse;
  }
}
