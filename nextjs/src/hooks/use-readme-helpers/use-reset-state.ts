import { useEffect } from "react";
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
}

export const useResetState = ({
  form,
  setGenerationState,
  setReadmeContent,
  setReadmeGenerationError,
  setErrorModalOpen,
}: ResetStateProps) => {
  const utils = api.useUtils();
  const { status } = useSession();

  const resetStates = async () => {
    // Reset form to default values
    form.reset(defaultFormValues);

    // Reset generation state
    setGenerationState(GenerationState.NOT_STARTED);
    setReadmeContent("");
    setReadmeGenerationError(null);
    setErrorModalOpen(false);

    // Clear all query caches
    await utils.invalidate();
  };

  // Only reset when auth status changes (not on every session change)
  useEffect(() => {
    void resetStates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  return {
    resetStates,
  };
};
