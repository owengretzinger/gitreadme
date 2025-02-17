import { useEffect } from "react";
import { api } from "~/trpc/react";
import { GenerationState } from "./use-readme-stream";

interface UseExistingReadmeProps {
  repoPath: string | undefined;
  version: number | null;
  readmeContent: string;
  generationState: GenerationState;
  setReadmeContent: (content: string) => void;
}

export const useExistingReadme = ({
  repoPath,
  version,
  readmeContent,
  generationState,
  setReadmeContent,
}: UseExistingReadmeProps) => {
  // Query to load existing README
  const { data: existingReadme, isLoading: isLoadingExistingReadme } =
    api.readme.getByRepoPath.useQuery(
      {
        repoPath: repoPath ?? "",
        version: version ?? undefined,
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
    }
  }, [existingReadme, readmeContent, setReadmeContent]);

  return {
    existingReadme,
    isLoadingExistingReadme,
  };
}; 