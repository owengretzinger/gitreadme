import { ArrowLeft } from "lucide-react";
import { Button } from "~/components/ui/button";
import { ReadmeInfoCard } from "~/components/readme/readme-info-card";
import { GeneratedReadme } from "~/components/readme/generated-readme";
import { useRouter } from "next/navigation";
import type { useReadme } from "../../hooks/use-readme";
import { api } from "~/trpc/react";
import { LoadingSteps } from "~/components/readme/loading-steps";
import { GenerationState } from "../../hooks/use-readme-helpers/use-readme-stream";

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
  readmeGenerationError,
  isLoadingExistingReadme,
  setReadmeContent,
  setReadmeGenerationState,
}: ReturnType<typeof useReadme>) {
  const router = useRouter();

  const { data: readmeInfo } = api.readme.getByRepoPath.useQuery(
    {
      repoPath: getRepoPath() ?? "",
    },
    {
      enabled: !!getRepoPath(),
    },
  );

  return (
    <div className="mx-auto max-w-4xl flex flex-col gap-5">
      <div className="">
        <Button
          variant="link"
          onClick={async () => {
            setReadmeContent("");
            setReadmeGenerationState(GenerationState.NOT_STARTED);
            router.push("/");
          }}
          className="gap-2 p-0"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to settings
        </Button>
      </div>

      {readmeGenerationError ? (
        <div className="text-red-500">{readmeGenerationError.message}</div>
      ) : isLoadingExistingReadme &&
        readmeGenerationState === GenerationState.NOT_STARTED ? (
        <LoadingSteps
          steps={["Loading Existing README"]}
          currentStep={"Loading Existing README"}
        />
      ) : readmeGenerationState === GenerationState.CONTACTING_SERVER ||
        readmeGenerationState === GenerationState.PACKING_REPOSITORY ||
        readmeGenerationState === GenerationState.WAITING_FOR_AI ? (
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
            content={readmeContent}
            generationState={readmeGenerationState}
          />
        </>
      )}
    </div>
  );
}
