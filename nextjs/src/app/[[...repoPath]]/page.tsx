"use client";

import { useParams, useSearchParams } from "next/navigation";
import GenerationSettings from "./generation-settings";
import { useReadme } from "./use-readme";
import ViewReadme from "./view-readme";
import { useEffect } from "react";
import { Toaster } from "~/components/ui/toaster";
import { GenerationState } from "./use-readme-stream";

export default function Readme() {
  const params = useParams<{ repoPath: string | undefined }>();
  const searchParams = useSearchParams();
  const repoPathFromUrl = Array.isArray(params.repoPath)
    ? params.repoPath.join("/")
    : params.repoPath!;
  const versionFromUrl = searchParams.get("v");

  const readmeGenerator = useReadme();

  // logic for loading existing readme from db based on the url
  useEffect(() => {
    if (repoPathFromUrl) {
      // currentRepoPath is the cached repo path
      const currentRepoPath = readmeGenerator.repoUrl?.split('github.com/')[1];
      
      // Check if we need to update anything
      const needsUrlUpdate = currentRepoPath !== repoPathFromUrl;
      const needsVersionUpdate = versionFromUrl && parseInt(versionFromUrl) !== readmeGenerator.version;
      
      if (needsUrlUpdate || needsVersionUpdate) {
        // Reset state if URL is changing
        if (needsUrlUpdate) {
          readmeGenerator.setReadmeContent("");
          readmeGenerator.setReadmeGenerationState(GenerationState.NOT_STARTED);
          readmeGenerator.setRepoUrl(`https://github.com/${repoPathFromUrl}`);
        }
        
        // Update version if needed
        if (needsVersionUpdate) {
          readmeGenerator.setVersion(parseInt(versionFromUrl));
        }
      }
    }
  }, [repoPathFromUrl, readmeGenerator, versionFromUrl]);

  useEffect(() => {
    console.log("repoPathFromUrl: ", repoPathFromUrl);
    console.log("readmeGenerator.repoUrl: ", readmeGenerator.repoUrl);
  }, [repoPathFromUrl, readmeGenerator.repoUrl]);

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
