"use client";

import { useParams } from "next/navigation";
import GenerationSettings from "./generation-settings";
import { useReadme } from "../../hooks/use-readme";
import ViewReadme from "./view-readme";
import { useEffect } from "react";
import { Toaster } from "~/components/ui/toaster";
import { GenerationState } from "../../hooks/use-readme-helpers/use-readme-stream";

export default function Readme() {
  const params = useParams<{ repoPath: string | undefined }>();
  const repoPathFromUrl = Array.isArray(params.repoPath)
    ? params.repoPath.join("/")
    : params.repoPath!;

  const readmeGenerator = useReadme();

  // logic for loading existing readme from db based on the url
  useEffect(() => {
    if (repoPathFromUrl) {
      // currentRepoPath is the cached repo path
      const currentRepoPath = readmeGenerator.repoUrl?.split("github.com/")[1];

      // Check if we need to update anything
      const needsUrlUpdate = currentRepoPath !== repoPathFromUrl;

      if (needsUrlUpdate) {
        // Reset state if URL is changing
        readmeGenerator.setReadmeContent("");
        readmeGenerator.setReadmeGenerationState(GenerationState.NOT_STARTED);
        readmeGenerator.setRepoUrl(`https://github.com/${repoPathFromUrl}`);
      }
    }
  }, [repoPathFromUrl, readmeGenerator]);

  return (
    <div className="p-4 lg:p-8">
      {!repoPathFromUrl && <GenerationSettings {...readmeGenerator} />}
      {repoPathFromUrl && readmeGenerator.repoUrl && (
        <ViewReadme {...readmeGenerator} />
      )}
      <Toaster />
    </div>
  );
}
