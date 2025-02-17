import { usePersistedForm } from "./use-readme-helpers/use-persisted-form";
import { useFormActions } from "./use-readme-helpers/use-form-actions";
import { useReadmeGeneration } from "./use-readme-helpers/use-readme-generation";
import { useResetStateOnAuth } from "./use-readme-helpers/use-reset-state-on-auth";
import { useReadmeStream } from "./use-readme-helpers/use-readme-stream";
import { useLatestVersion } from "./use-readme-helpers/use-latest-version";
import { useExistingReadme } from "./use-readme-helpers/use-existing-readme";
import { ErrorType, type TokenLimitErrorResponse } from "~/types/errors";

export const useReadme = () => {
  const form = usePersistedForm();
  const formActions = useFormActions(form);
  const generation = useReadmeGeneration(form, formActions.getRepoPath);
  const {
    generationState,
    readmeContent,
    generationError,
    setGenerationState,
    setReadmeContent,
    setReadmeGenerationError,
    errorModalOpen,
    setErrorModalOpen,
  } = useReadmeStream();

  useResetStateOnAuth({
    form,
    setGenerationState,
    setReadmeContent,
    setReadmeGenerationError,
    setErrorModalOpen,
  });

  // Handle latest version
  useLatestVersion({
    repoPath: formActions.getRepoPath(),
    currentVersion: generation.version,
    setVersion: generation.setVersion,
  });

  // Handle existing readme
  const { isLoadingExistingReadme } = useExistingReadme({
    repoPath: formActions.getRepoPath(),
    version: generation.version,
    readmeContent,
    generationState,
    setReadmeContent,
  });

  const currentVersion = generation.version;

  return {
    // Form state and actions
    form,
    formState: form.formState,
    ...formActions,

    // Generation
    generateReadme: generation.generateReadme,
    readmeGenerationState: generationState,
    readmeContent,
    readmeGenerationError: generationError,
    setReadmeGenerationState: setGenerationState,
    errorModalOpen,
    setErrorModalOpen,
    version: currentVersion,
    setVersion: generation.setVersion,
    setGenerationState,
    setReadmeContent,
    setReadmeGenerationError,

    // Rate limit info
    rateLimitInfo: generation.rateLimitInfo,
    largeFiles:
      generationError?.type === ErrorType.TOKEN_LIMIT
        ? (generationError as TokenLimitErrorResponse).largest_files
        : null,

    // Loading state
    isLoadingExistingReadme,
  };
};
