import { ArrowLeft } from "lucide-react";
import { Button } from "~/components/ui/button";
import { ReadmeInfoCard } from "~/components/readme/readme-info-card";
import { GeneratedReadme } from "~/components/readme/generated-readme";
import { useRouter } from "next/navigation";
import type { useReadme } from "./use-readme";
import { api } from "~/trpc/react";
import { LoadingSteps } from "~/components/readme/loading-steps";
import { GenerationState } from "./use-readme-stream";

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
  repoUrl,
  getRepoPath,
  readmeGenerationState,
  readmeContent,
  readmeGenerationError,
  version,
  isLoadingExistingReadme,
  setVersion,
  setReadmeContent,
  setReadmeGenerationState,
}: ReturnType<typeof useReadme>) {
  const router = useRouter();

  const { data: readmeInfo } = api.readme.getByRepoPath.useQuery(
    {
      repoPath: getRepoPath() ?? "",
      version: version ?? undefined,
    },
    {
      enabled: !!getRepoPath() && version !== null,
    },
  );

  return (
    <div className="p-4 md:p-8">
      <h1 className="mb-4 text-4xl font-bold">README Generator</h1>

      <div className="mb-4">
        <Button
          variant="ghost"
          onClick={async () => {
            setVersion(null);
            setReadmeContent("");
            setReadmeGenerationState(GenerationState.NOT_STARTED);
            router.push("/new");
          }}
          className="gap-2"
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
            version={version ?? 0}
            createdAt={readmeInfo?.createdAt ?? new Date()}
            currentUrl={repoUrl}
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
