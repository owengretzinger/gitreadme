"use client";

export const dynamic = "force-dynamic";

import { useParams } from "next/navigation";
import GenerationSettings from "./generation-settings";
import { useReadme } from "../../hooks/use-readme";
import ViewReadme from "./view-readme";
import { useEffect } from "react";
import { GenerationState } from "../../hooks/use-readme-helpers/use-readme-stream";
import ReadmeLoading from "./readme-loading";
import { trackReadmeView } from "~/lib/posthog";

export default function Readme() {
  const readmeGenerator = useReadme();

  const params = useParams<{ repoPath: string[] | undefined }>();
  const pathSegments = params.repoPath ?? [];

  const repoPath =
    pathSegments.length >= 2
      ? (pathSegments[0] + "/" + pathSegments[1]).toLowerCase()
      : undefined;
  const shortId =
    pathSegments.length >= 3
      ? pathSegments[2]
      : (readmeGenerator.shortId ?? undefined);

  useEffect(() => {
    const repoChanged = readmeGenerator.getRepoPath() !== repoPath;
    const shortIdChanged = readmeGenerator.shortId !== shortId;

    if (repoChanged || shortIdChanged) {
      // Force reset state if we've navigated to a different readme
      readmeGenerator.setGenerationState(GenerationState.NOT_STARTED);
      readmeGenerator.setReadmeContent("");
      readmeGenerator.setJustGenerated(false);
      if (shortId) readmeGenerator.setShortId(shortId);
      if (repoPath) readmeGenerator.setRepoUrlFromPath(repoPath);
    }

    if (
      repoPath &&
      shortId &&
      readmeGenerator.readmeGenerationState === GenerationState.NOT_STARTED
    ) {
      // opened existing readme, load from db
      readmeGenerator.loadExistingReadme.mutate({
        repoPath,
        shortId,
      });
      trackReadmeView({
        repo_path: repoPath,
        short_id: shortId,
      });
    } else if (
      repoPath &&
      readmeGenerator.readmeGenerationState === GenerationState.NOT_STARTED
    ) {
      // opened new readme, generate
      readmeGenerator.setGenerationState(GenerationState.CONTACTING_SERVER);
      void readmeGenerator.generateReadme();
    } else {
      // generation settings page
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repoPath, shortId]);

  if (!repoPath) {
    return <GenerationSettings {...readmeGenerator} />;
  } else if (
    repoPath &&
    shortId &&
    (readmeGenerator.readmeGenerationState === GenerationState.COMPLETED ||
      readmeGenerator.readmeGenerationState === GenerationState.STREAMING)
  ) {
    return <ViewReadme {...readmeGenerator} />;
  } else {
    return <ReadmeLoading {...readmeGenerator} />;
  }
}
