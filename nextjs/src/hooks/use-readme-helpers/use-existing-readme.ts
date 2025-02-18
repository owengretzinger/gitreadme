import { useEffect } from "react";
import { api } from "~/trpc/react";
import { GenerationState } from "./use-readme-stream";

interface UseExistingReadmeProps {
  repoPath: string | undefined;
  readmeContent: string;
  generationState: GenerationState;
  setReadmeContent: (content: string) => void;
  setGenerationState: (state: GenerationState) => void;
}

export const useExistingReadme = ({
  repoPath,
  readmeContent,
  generationState,
  setReadmeContent,
  setGenerationState,
}: UseExistingReadmeProps) => {
  // Query to load existing README
  const { data: existingReadme, isLoading: isLoadingExistingReadme } =
    api.readme.getByRepoPath.useQuery(
      {
        repoPath: repoPath ?? "",
      },
      {
        enabled:
          !!repoPath &&
          !readmeContent &&
          generationState === GenerationState.NOT_STARTED,
      },
    );

  // Set the content from the database if it exists
  useEffect(() => {
    if (existingReadme && !readmeContent) {
      setReadmeContent(existingReadme.content);
      setGenerationState(GenerationState.COMPLETED);
    }
  }, [existingReadme, readmeContent, setGenerationState, setReadmeContent]);

  return {
    existingReadme,
    isLoadingExistingReadme,
  };
};
