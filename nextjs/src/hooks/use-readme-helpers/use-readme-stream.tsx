import { useEffect } from "react";
import { toast } from "~/hooks/use-toast";
import { api } from "~/trpc/react";
import { ErrorType, type ApiErrorResponse } from "~/types/errors";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

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

  return {
    // State
    generationState,
    readmeContent,
    error,
    errorModalOpen,
    // Keys
    stateKey,
    contentKey,
    errorKey,
    errorModalKey,
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
  };
};

const useStreamHandlers = (state: ReturnType<typeof useGenerationState>) => {
  const router = useRouter();

  const handleError = (error: ApiErrorResponse) => {
    console.log("Error handling:", error);
    state.setState(GenerationState.COMPLETED);
    state.setError(error);
    state.setErrorModalOpen(true);
    router.push("/");
  };

  const handleStreamChunk = async (
    rawChunk: string,
    hasStartedStreaming: boolean,
  ): Promise<{ hasStartedStreaming: boolean; hasError: boolean }> => {
    console.log("Received chunk:", rawChunk);

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
            : { type: "UNKNOWN" as const, rawChunk };

    console.log("Processed chunk:", chunk);

    switch (chunk.type) {
      case "STATUS_UPDATE":
        console.log("Status update, setting state to WAITING_FOR_AI");
        state.setState(GenerationState.WAITING_FOR_AI);
        break;

      case "ERROR":
        console.log("Error chunk received:", chunk.error);
        handleError(chunk.error);
        return { hasStartedStreaming, hasError: true };

      case "README_STREAM":
        if (!hasStartedStreaming) {
          console.log("First content chunk, setting state to STREAMING");
          state.setState(GenerationState.STREAMING);
        }
        console.log("Adding content:", chunk.content);
        state.setContent((prev: string | null) => (prev ?? "") + chunk.content);
        return { hasStartedStreaming: true, hasError: false };

      case "UNKNOWN":
        console.log("Unknown chunk type:", chunk.rawChunk);
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

  const generateReadmeStream = api.readme.generateReadmeStream.useMutation({
    onMutate: () => {
      console.log("Stream mutation starting");
      state.setState(GenerationState.CONTACTING_SERVER);
      state.setContent("");
      state.setError(null);
      state.setErrorModalOpen(false);
    },
    async onSuccess(stream) {
      try {
        console.log("Stream started, current state:", state.generationState);
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

        console.log("Stream complete, state:", state.generationState);
        console.log("Stream complete, error:", state.error);

        if (!hasError) {
          console.log("Stream complete, setting state to COMPLETED");
          state.setState(GenerationState.COMPLETED);
          toast({
            description: "README generated successfully!",
          });
        }
      } catch (error) {
        console.error("Stream error:", error);
        handleError(error as ApiErrorResponse);
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

  useEffect(() => {
    console.log("readmeContent", state.readmeContent);
    console.log("generationState", state.generationState);
    console.log("error", state.error);
  }, [state.readmeContent, state.generationState, state.error]);

  return {
    generationState: state.generationState,
    readmeContent: state.readmeContent,
    generateReadmeStream,
    generationError: state.error,
    setGenerationState: state.setState,
    setReadmeContent: state.setContent,
    setReadmeGenerationError: state.setError,
    errorModalOpen: state.errorModalOpen,
    setErrorModalOpen: state.setErrorModalOpen,
  };
};
