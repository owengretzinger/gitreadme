import { ArrowLeft } from "lucide-react";
import { Button } from "~/components/ui/button";
import { ReadmeInfoCard } from "~/components/readme/readme-info-card";
import { GeneratedReadme } from "~/components/readme/generated-readme";
import type { useReadme } from "../../hooks/use-readme";
import { api } from "~/trpc/react";
import { LoadingSteps } from "~/components/readme/loading-steps";
import { GenerationState } from "../../hooks/use-readme-helpers/use-readme-stream";
import Link from "next/link";
import { useEffect } from "react";

const GENERATION_STEPS = [
  {
    state: GenerationState.CONTACTING_SERVER,
    label: "Contacting server",
  },
  {
    state: GenerationState.PACKING_REPOSITORY,
    label: "Packing repository",
  },
  {
    state: GenerationState.WAITING_FOR_AI,
    label: "Sending to AI",
  },
  {
    state: GenerationState.STREAMING,
    label: "Streaming response",
  },
] as const;

export default function ViewReadme({
  getRepoPath,
  readmeGenerationState,
  readmeContent,
  isLoadingExistingReadme,
}: ReturnType<typeof useReadme>) {
  const { data: readmeInfo } = api.readme.getByRepoPath.useQuery(
    {
      repoPath: getRepoPath() ?? "",
    },
    {
      enabled: !!getRepoPath(),
    },
  );

  useEffect(() => {
    console.log("readmeGenerationState", readmeGenerationState);
  }, [readmeGenerationState]);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
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

      {isLoadingExistingReadme &&
      readmeGenerationState !== GenerationState.CONTACTING_SERVER ? (
        <LoadingSteps
          steps={["Loading Existing README"]}
          currentStep={"Loading Existing README"}
        />
      ) : readmeGenerationState === GenerationState.CONTACTING_SERVER ||
        readmeGenerationState === GenerationState.PACKING_REPOSITORY ||
        readmeGenerationState === GenerationState.WAITING_FOR_AI ||
        readmeGenerationState === GenerationState.NOT_STARTED ? (
        <LoadingSteps
          steps={GENERATION_STEPS.map((step) => step.label)}
          currentStep={
            GENERATION_STEPS.find(
              (step) => step.state === readmeGenerationState,
            )?.label ?? ""
          }
        />
      ) : (
        <>
          <ReadmeInfoCard
            repoPath={getRepoPath() ?? "No repo path"}
            createdAt={readmeInfo?.updatedAt ?? new Date()}
            permalink={`${typeof window !== "undefined" ? window.location.origin : ""}/${getRepoPath()}`}
          />
          <GeneratedReadme
            initialContent={readmeContent}
            generationState={readmeGenerationState}
            repoPath={getRepoPath() ?? ""}
          />
        </>
      )}
    </div>
  );
}
