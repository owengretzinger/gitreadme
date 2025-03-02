import { usePersistedForm } from "./use-readme-helpers/use-persisted-form";
import { useFormActions } from "./use-readme-helpers/use-form-actions";
import { useReadmeGeneration } from "./use-readme-helpers/use-readme-generation";
import { useResetStateOnAuth } from "./use-readme-helpers/use-reset-state-on-auth";
import {
  GenerationState,
  useReadmeStream,
} from "./use-readme-helpers/use-readme-stream";
import { ErrorType, type TokenLimitErrorResponse } from "~/types/errors";
import { api } from "~/trpc/react";

export const useReadme = () => {
  const form = usePersistedForm();
  const formActions = useFormActions(form);
  const generation = useReadmeGeneration(form);

  const {
    generationState,
    readmeContent,
    shortId,
    justGenerated,
    generationError,
    setGenerationState,
    setReadmeContent,
    setReadmeGenerationError,
    setShortId,
    setJustGenerated,
    errorModalOpen,
    setErrorModalOpen,
  } = useReadmeStream();

  useResetStateOnAuth({
    form,
    setGenerationState,
    setReadmeContent,
    setReadmeGenerationError,
    setErrorModalOpen,
    setShortId,
    setJustGenerated,
  });

  const loadExistingReadme = api.readme.getByShortId.useMutation({
    onSuccess: (data) => {
      setReadmeContent(data.content);
      setGenerationState(GenerationState.COMPLETED);
      setShortId(data.shortId);
      setJustGenerated(false);
      formActions.setRepoUrlFromPath(data.repoPath);
    },
  });
  const isLoadingExistingReadme = loadExistingReadme.isPending;

  return {
    // Form state and actions
    form,
    formState: form.formState,
    ...formActions,

    // Generation
    generateReadme: generation.generateReadme,
    loadExistingReadme,
    isLoadingExistingReadme,
    readmeGenerationState: generationState,
    readmeContent,
    shortId,
    justGenerated,
    readmeGenerationError: generationError,
    setReadmeGenerationState: setGenerationState,
    errorModalOpen,
    setErrorModalOpen,
    setGenerationState,
    setReadmeContent,
    setReadmeGenerationError,
    setShortId,
    setJustGenerated,

    // Rate limit info
    rateLimitInfo: generation.rateLimitInfo,
    largeFiles:
      generationError?.type === ErrorType.TOKEN_LIMIT
        ? (generationError as TokenLimitErrorResponse).largest_files
        : null,
  };
};
