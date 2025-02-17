import { useEffect } from "react";
import { api } from "~/trpc/react";

interface UseLatestVersionProps {
  repoPath: string | undefined;
  currentVersion: number | null;
  setVersion: (version: number | null) => void;
}

export const useLatestVersion = ({
  repoPath,
  currentVersion,
  setVersion,
}: UseLatestVersionProps) => {
  // Query to get latest version if none provided
  const { data: latestVersion } = api.readme.getMostRecentVersion.useQuery(
    { repoPath: repoPath ?? "" },
    {
      enabled: !!repoPath && currentVersion === null,
    },
  );

  // Set the version to latest if none provided
  useEffect(() => {
    if (latestVersion && currentVersion === null) {
      setVersion(latestVersion.version);
    }
  }, [latestVersion, currentVersion, setVersion]);

  return {
    latestVersion,
  };
}; 