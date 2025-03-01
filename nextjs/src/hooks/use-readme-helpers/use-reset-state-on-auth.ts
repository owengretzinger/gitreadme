import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { api } from "~/trpc/react";
import { type UseFormReturn } from "react-hook-form";
import { type ReadmeFormData, defaultFormValues } from "./types";
import { GenerationState } from "./use-readme-stream";

interface ResetStateProps {
  form: UseFormReturn<ReadmeFormData>;
  setGenerationState: (state: GenerationState) => void;
  setReadmeContent: (content: string) => void;
  setReadmeGenerationError: (error: null) => void;
  setErrorModalOpen: (open: boolean) => void;
  setShortId: (id: string) => void;
}

export const useResetStateOnAuth = ({
  form,
  setGenerationState,
  setReadmeContent,
  setReadmeGenerationError,
  setErrorModalOpen,
  setShortId,
}: ResetStateProps) => {
  const utils = api.useUtils();
  const { status } = useSession();
  const prevStatusRef = useRef(status);

  const resetStates = async () => {
    // Reset form to default values
    form.reset(defaultFormValues);

    // Reset generation state
    setGenerationState(GenerationState.NOT_STARTED);
    setReadmeContent("");
    setReadmeGenerationError(null);
    setErrorModalOpen(false);
    setShortId("");

    // Clear all query caches
    await utils.invalidate();
  };

  // Only reset on actual sign in/out transitions
  useEffect(() => {
    const isSigningIn =
      prevStatusRef.current === "unauthenticated" && status === "authenticated";
    const isSigningOut =
      prevStatusRef.current === "authenticated" && status === "unauthenticated";

    if (isSigningIn || isSigningOut) {
      void resetStates();
    }

    // Don't update the ref during loading state to maintain the previous authenticated/unauthenticated state
    if (status !== "loading") {
      prevStatusRef.current = status;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  return {
    resetStates,
  };
};
