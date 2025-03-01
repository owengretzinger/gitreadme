import { Check, Loader2 } from "lucide-react";
import { cn } from "~/lib/utils";

export function LoadingSteps({
  steps,
  currentStep,
}: {
  steps: string[];
  currentStep: string;
}) {
  // Find the index of the current step
  const currentStepIndex = steps.findIndex((step) => step === currentStep);
  const translateY = -currentStepIndex * 24;

  return (
    <div className="flex min-h-[600px] h-full flex-col flex-1 items-center justify-center">
      <div
        className="relative h-[300px] flex flex-col items-start gap-3 transition-all duration-500 ease-in-out"
        style={{
          transform: `translateY(${translateY}px)`,
        }}
      >
        {steps.map((step, index) => {
          const isComplete = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const isPending = index > currentStepIndex;

          return (
            <div
              key={step}
              className={cn("flex items-center gap-3", {
                "text-muted-foreground": isCurrent,
                "text-muted-foreground/40": isPending,
                "text-green-500": isComplete,
              })}
            >
              <div className="flex h-4 w-4 items-center justify-center">
                {isCurrent && <Loader2 className="h-4 w-4 animate-spin" />}
                {isComplete && <Check className="h-4 w-4" />}
              </div>
              <span className="text-sm font-medium">{step}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
