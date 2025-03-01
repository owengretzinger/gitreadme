import { LoadingSteps } from "~/components/readme/loading-steps";
import { GenerationState } from "~/hooks/use-readme-helpers/use-readme-stream";

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

export default function ReadmeLoading({
  readmeGenerationState,
  isLoadingExistingReadme,
}: {
  readmeGenerationState: GenerationState;
  isLoadingExistingReadme: boolean;
}) {
  if (isLoadingExistingReadme) {
    return (
      <LoadingSteps
        steps={["Loading Existing README"]}
        currentStep={"Loading Existing README"}
      />
    );
  } else {
    return (
      <LoadingSteps
        steps={GENERATION_STEPS.map((step) => step.label)}
        currentStep={
          GENERATION_STEPS.find((step) => step.state === readmeGenerationState)
            ?.label ?? ""
        }
      />
    );
  }
}
