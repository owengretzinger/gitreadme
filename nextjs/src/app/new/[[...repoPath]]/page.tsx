"use client";

import { useParams, useSearchParams } from "next/navigation";
import GenerationSettings from "./generation-settings";
import { useReadme } from "./use-readme";
import ViewReadme from "./view-readme";
import { useEffect } from "react";
import { Toaster } from "~/components/ui/toaster";

export default function Readme() {
  const params = useParams<{ repoPath: string | undefined }>();
  const searchParams = useSearchParams();
  const repoPathFromUrl = Array.isArray(params.repoPath)
    ? params.repoPath.join("/")
    : params.repoPath!;

  const readmeGenerator = useReadme();

  useEffect(() => {
    if (repoPathFromUrl && !readmeGenerator.repoUrl) {
      // we need to set all the readme info instead of just the url
      readmeGenerator.setRepoUrlFromPath(repoPathFromUrl);
      // Set version from URL if it exists, otherwise let the hook handle getting latest version
      const versionFromUrl = searchParams.get("v");
      if (versionFromUrl) {
        readmeGenerator.setVersion(parseInt(versionFromUrl));
      }
    }
  }, [repoPathFromUrl, readmeGenerator.repoUrl, readmeGenerator, searchParams]);

  useEffect(() => {
    console.log("repoPathFromUrl: ", repoPathFromUrl);
    console.log("readmeGenerator.repoUrl: ", readmeGenerator.repoUrl);
  }, [repoPathFromUrl, readmeGenerator.repoUrl]);

  return (
    <div>
      {!repoPathFromUrl && <GenerationSettings {...readmeGenerator} />}
      {repoPathFromUrl && !readmeGenerator.repoUrl && !readmeGenerator.isLoadingExistingReadme && (
        <div>Loading...</div>
      )}
      {repoPathFromUrl && readmeGenerator.repoUrl && (
        <ViewReadme {...readmeGenerator} />
      )}
      <Toaster />
    </div>
  );
}
