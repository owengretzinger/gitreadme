"use client";

import { useParams } from "next/navigation";
import GenerationSettings from "./generation-settings";
import { useReadme } from "./use-readme";
import ViewReadme from "./view-readme";
import { useEffect } from "react";
import { Toaster } from "~/components/ui/toaster";

export default function Readme() {
  const params = useParams<{ repoPath: string | undefined }>();
  const repoPathFromUrl = Array.isArray(params.repoPath)
    ? params.repoPath.join("/")
    : params.repoPath!;

  const readmeGenerator = useReadme();

  useEffect(() => {
    if (repoPathFromUrl && !readmeGenerator.repoUrl) {
      readmeGenerator.setRepoUrlFromPath(repoPathFromUrl);
    }
  }, [repoPathFromUrl, readmeGenerator.repoUrl, readmeGenerator]);

  useEffect(() => {
    console.log("repoPathFromUrl: ", repoPathFromUrl);
    console.log("readmeGenerator.repoUrl: ", readmeGenerator.repoUrl);
  }, [repoPathFromUrl, readmeGenerator.repoUrl]);

  return (
    <div>
      {!repoPathFromUrl && <GenerationSettings {...readmeGenerator} />}
      {repoPathFromUrl && !readmeGenerator.repoUrl && <div>Loading...</div>}
      {repoPathFromUrl && readmeGenerator.repoUrl && (
        <ViewReadme {...readmeGenerator} />
      )}
      <Toaster />
    </div>
  );
}
