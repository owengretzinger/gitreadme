import { toast } from "~/hooks/use-toast";
import { api } from "~/trpc/react";
import { ErrorType, type ApiErrorResponse } from "~/types/errors";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { trackGenerationError } from "~/lib/posthog";

export enum GenerationState {
  NOT_STARTED = "NOT_STARTED",
  CONTACTING_SERVER = "CONTACTING_SERVER",
  PACKING_REPOSITORY = "PACKING_REPOSITORY",
  WAITING_FOR_AI = "WAITING_FOR_AI",
  STREAMING = "STREAMING",
  COMPLETED = "COMPLETED",
}

interface GenerationError {
  type: string;
  message: string;
}

export class RateLimitError implements GenerationError {
  type = "RATE_LIMIT";
  constructor(public message: string) {}
}

export class RepoNotFoundError implements GenerationError {
  type = "REPO_NOT_FOUND";
  constructor(public message: string) {}
}

export class TooManyTokensError implements GenerationError {
  type = "TOO_MANY_TOKENS";
  constructor(public message: string) {}
}

export class UnknownError implements GenerationError {
  type = "UNKNOWN";
  constructor(public message: string) {}
}

// interface ErrorResponse {
//   isLoading: false;
//   generationState: GenerationState;
//   error: GenerationError;
//   data: null;
// }

// interface SuccessResponse {
//   isLoading: false;
//   generationState: GenerationState.STREAMING | GenerationState.IDLE;
//   error: null;
//   data: {
//     repoPath: string;
//     id: string;
//     userId: string | null;
//     content: string;
//     createdAt: Date | null;
//     updatedAt: Date | null;
//   };
// }

// interface LoadingRespone {
//   isLoading: true;
//   generationState:
//     | GenerationState.CONTACTING_SERVER
//     | GenerationState.PACKING_REPOSITORY
//     | GenerationState.WAITING_FOR_AI;
//   error: null;
//   data: null;
// }

// type ReadmeResponse = ErrorResponse | SuccessResponse | LoadingRespone;

const useGenerationState = () => {
  const queryClient = useQueryClient();
  const stateKey = ["readmeGenerationState"] as const;
  const contentKey = ["readmeContent"] as const;
  const errorKey = ["readmeError"] as const;
  const errorModalKey = ["readmeErrorModal"] as const;
  const shortIdKey = ["readmeShortId"] as const;
  const justGeneratedKey = ["readmeJustGenerated"] as const;

  const { data: generationState = GenerationState.NOT_STARTED } = useQuery({
    queryKey: stateKey,
    queryFn: () => GenerationState.NOT_STARTED,
    enabled: false,
  });

  const { data: readmeContent = "" } = useQuery({
    queryKey: contentKey,
    queryFn: () => "",
    enabled: false,
  });

  const { data: error = null } = useQuery({
    queryKey: errorKey,
    queryFn: () => null as ApiErrorResponse | null,
    enabled: false,
  });

  const { data: errorModalOpen = false } = useQuery({
    queryKey: errorModalKey,
    queryFn: () => false,
    enabled: false,
  });

  const { data: shortId = "" } = useQuery({
    queryKey: shortIdKey,
    queryFn: () => "",
    enabled: false,
  });

  const { data: justGenerated = false } = useQuery({
    queryKey: justGeneratedKey,
    queryFn: () => false,
    enabled: false,
  });

  return {
    // State
    generationState,
    readmeContent,
    error,
    errorModalOpen,
    shortId,
    justGenerated,
    // Keys
    stateKey,
    contentKey,
    errorKey,
    errorModalKey,
    shortIdKey,
    justGeneratedKey,
    // Actions
    setState: (state: GenerationState) =>
      queryClient.setQueryData(stateKey, state),
    setContent: (updater: string | ((prev: string | null) => string)) =>
      queryClient.setQueryData(contentKey, updater),
    setError: (error: ApiErrorResponse | null) =>
      queryClient.setQueryData(errorKey, error),
    setErrorModalOpen: (open: boolean) => {
      queryClient.setQueryData(errorModalKey, open);
      if (!open) {
        queryClient.setQueryData(errorKey, null);
      }
    },
    setShortId: (id: string) => queryClient.setQueryData(shortIdKey, id),
    setJustGenerated: (value: boolean) =>
      queryClient.setQueryData(justGeneratedKey, value),
  };
};

const useStreamHandlers = (state: ReturnType<typeof useGenerationState>) => {
  const router = useRouter();

  const handleError = (error: ApiErrorResponse) => {
    console.log("Error handling:", error);
    state.setState(GenerationState.NOT_STARTED);
    state.setError(error);
    state.setErrorModalOpen(true);
    router.push("/");

    // Track the error
    const pathname = window.location.pathname;
    const repoPath = pathname.startsWith("/") ? pathname.slice(1) : pathname;
    trackGenerationError({
      repo_path: repoPath || "",
      error_type: error.type,
      message: error.message,
    });
  };

  const handleStreamChunk = async (
    rawChunk: string,
    hasStartedStreaming: boolean,
  ): Promise<{ hasStartedStreaming: boolean; hasError: boolean }> => {
    const chunk =
      rawChunk === "DONE_PACKING"
        ? { type: "STATUS_UPDATE" as const }
        : rawChunk.startsWith("ERROR:")
          ? {
              type: "ERROR" as const,
              error: JSON.parse(
                rawChunk.replace("ERROR:", ""),
              ) as ApiErrorResponse,
            }
          : rawChunk.startsWith("AI:")
            ? { type: "README_STREAM" as const, content: rawChunk.slice(3) }
            : rawChunk.startsWith("SHORT_ID:")
              ? { type: "SHORT_ID" as const, id: rawChunk.slice(9) }
              : { type: "UNKNOWN" as const, rawChunk };

    switch (chunk.type) {
      case "STATUS_UPDATE":
        state.setState(GenerationState.WAITING_FOR_AI);
        break;

      case "ERROR":
        handleError(chunk.error);
        return { hasStartedStreaming, hasError: true };

      case "README_STREAM":
        if (!hasStartedStreaming) {
          state.setState(GenerationState.STREAMING);
        }
        state.setContent((prev: string | null) => (prev ?? "") + chunk.content);
        return { hasStartedStreaming: true, hasError: false };

      case "SHORT_ID":
        state.setShortId(chunk.id);
        const currentURL = window.location.pathname
          .split("/")
          .slice(0, 3)
          .join("/");
        window.history.pushState({}, "", currentURL + `/${chunk.id}`);
        break;

      case "UNKNOWN":
        break;
    }
    return { hasStartedStreaming, hasError: false };
  };

  return {
    handleError,
    handleStreamChunk,
  };
};

export const useReadmeStream = () => {
  const state = useGenerationState();
  const { handleError, handleStreamChunk } = useStreamHandlers(state);
  const utils = api.useUtils();

  const generateReadmeStream = api.readme.generateReadmeStream.useMutation({
    onMutate: () => {
      state.setState(GenerationState.CONTACTING_SERVER);
      state.setContent("");
      state.setError(null);
      state.setErrorModalOpen(false);
      state.setJustGenerated(true);
    },
    async onSuccess(stream) {
      try {
        state.setState(GenerationState.PACKING_REPOSITORY);
        let hasStartedStreaming = false;
        let hasError = false;

        for await (const rawChunk of stream) {
          const result = await handleStreamChunk(rawChunk, hasStartedStreaming);
          hasStartedStreaming = result.hasStartedStreaming;
          if (result.hasError) {
            hasError = true;
          }
        }

        if (!hasError) {
          state.setState(GenerationState.COMPLETED);
          toast({
            description: "README generated successfully!",
          });
          await utils.readme.getRecentReadmes.invalidate();
        }
      } catch (err: unknown) {
        console.error("Stream error:", err);
        handleError({
          type: ErrorType.UNKNOWN,
          message:
            err instanceof Error ? err.message : "An unknown error occurred",
        });
      }
    },
    onError: (error) => {
      console.error("Mutation error:", error);
      handleError({
        type: ErrorType.UNKNOWN,
        message: error.message,
      });
    },
  });

  return {
    generationState: state.generationState,
    readmeContent: state.readmeContent,
    shortId: state.shortId,
    justGenerated: state.justGenerated,
    generateReadmeStream,
    generationError: state.error,
    setGenerationState: state.setState,
    setReadmeContent: state.setContent,
    setReadmeGenerationError: state.setError,
    setShortId: state.setShortId,
    setJustGenerated: state.setJustGenerated,
    errorModalOpen: state.errorModalOpen,
    setErrorModalOpen: state.setErrorModalOpen,
    handleError,
  };
};
