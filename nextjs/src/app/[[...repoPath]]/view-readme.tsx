import { ArrowLeft, Lightbulb } from "lucide-react";
import { Button } from "~/components/ui/button";
import { ReadmeInfoCard } from "~/components/readme/readme-info-card";
import { GeneratedReadme } from "~/components/readme/generated-readme";
import type { useReadme } from "../../hooks/use-readme";
import Link from "next/link";
import { useState } from "react";
import { NextStepsModal } from "~/components/readme/modals/next-steps-modal";

export default function ViewReadme({
  getRepoPath,
  readmeGenerationState,
  readmeContent,
  shortId,
  loadExistingReadme,
  justGenerated,
}: ReturnType<typeof useReadme>) {
  const permalinkPath = `/${getRepoPath()}/${shortId}`;
  // Get isOwner from the loadExistingReadme.data or if just generated
  const isOwner = (loadExistingReadme.data?.isOwner ?? false) || (justGenerated ?? false);
  const [nextStepsModalOpen, setNextStepsModalOpen] = useState(false);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 pb-20">
      <div className="flex items-center justify-between">
        <Button variant="link" className="gap-2 p-0">
          <Link href="/">
            <span className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to settings
            </span>
          </Link>
        </Button>
        
        <div
          className="group flex cursor-pointer items-center gap-1.5 rounded-md bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-500 transition-all hover:scale-[1.06]"
          onClick={() => setNextStepsModalOpen(true)}
        >
          <Lightbulb className="h-4 w-4" />
          <span className="">Next Steps</span>
        </div>
      </div>
      <ReadmeInfoCard
        repoPath={getRepoPath() ?? "No repo path"}
        createdAt={loadExistingReadme.data?.createdAt ?? new Date()}
        permalink={`${typeof window !== "undefined" ? window.location.origin : ""}${permalinkPath}`}
        shortId={shortId}
      />
      <GeneratedReadme
        initialContent={readmeContent}
        generationState={readmeGenerationState}
        repoPath={getRepoPath() ?? ""}
        shortId={shortId ?? ""}
        isOwner={isOwner}
      />

      <NextStepsModal 
        open={nextStepsModalOpen}
        onOpenChange={setNextStepsModalOpen}
      />
    </div>
  );
}
