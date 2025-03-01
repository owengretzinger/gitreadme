import { ArrowLeft } from "lucide-react";
import { Button } from "~/components/ui/button";
import { ReadmeInfoCard } from "~/components/readme/readme-info-card";
import { GeneratedReadme } from "~/components/readme/generated-readme";
import type { useReadme } from "../../hooks/use-readme";
import Link from "next/link";

export default function ViewReadme({
  getRepoPath,
  readmeGenerationState,
  readmeContent,
  shortId,
}: ReturnType<typeof useReadme>) {
  const permalinkPath = `/${getRepoPath()}/${shortId}`;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 pb-20">
      <div className="">
        <Button variant="link" className="gap-2 p-0">
          <Link href="/">
            <span className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to settings
            </span>
          </Link>
        </Button>
      </div>
      <ReadmeInfoCard
        repoPath={getRepoPath() ?? "No repo path"}
        createdAt={new Date()}
        permalink={`${typeof window !== "undefined" ? window.location.origin : ""}${permalinkPath}`}
        shortId={shortId}
      />
      <GeneratedReadme
        initialContent={readmeContent}
        generationState={readmeGenerationState}
        repoPath={getRepoPath() ?? ""}
        shortId={shortId ?? ""}
      />
    </div>
  );
}
