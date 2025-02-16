import { FileText, MinusCircle, Settings } from "lucide-react";
import { useState } from "react";
import { CustomInstructionsModal } from "~/components/readme/modals/custom-instructions-modal";
import { FileExclusionModal } from "~/components/readme/modals/file-exclusion-modal";
import { TemplateModal } from "~/components/readme/modals/template-modal";
import { ErrorModal } from "~/components/readme/modals/error-modal";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { type useReadme } from "./use-readme";
import { cn } from "~/lib/utils";
import { RateLimitInfo } from "~/components/readme/rate-limit-info";
import { useSession } from "next-auth/react";
import { ErrorType } from "~/types/errors";
import { GenerationState } from "./use-readme-stream";

export default function GenerationSettings({
  formState,
  repoRegister,
  selectedTemplate,
  setSelectedTemplate,
  templateContent,
  setTemplateContent,
  additionalContext,
  setAdditionalContext,
  excludePatterns,
  setExcludePatterns,
  generateReadme,
  largeFiles,
  readmeGenerationError,
  errorModalOpen,
  setErrorModalOpen,
  rateLimitInfo,
  setGenerationState,
}: ReturnType<typeof useReadme>) {
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [fileExclusionModalOpen, setFileExclusionModalOpen] = useState(false);
  const [customInstructionsModalOpen, setCustomInstructionsModalOpen] =
    useState(false);
  const { data: session, status } = useSession();

  return (
    <div className="mx-auto mt-24 w-full max-w-4xl space-y-8">
      <div className="space-y-4">
        <div className="flex justify-center">
          <RateLimitInfo rateLimitInfo={rateLimitInfo} status={status} />
        </div>
        <h1 className="mt-4 text-center text-4xl font-bold">
          README Generator
        </h1>
        <p className="text-center text-lg text-muted-foreground">
          Generate a comprehensive README for your GitHub repository powered by
          AI.
        </p>
      </div>
      <div className="space-y-6">
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setGenerationState(GenerationState.CONTACTING_SERVER);
            await generateReadme();
          }}
        >
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Input
                placeholder="https://github.com/username/repo"
                className={cn(
                  "h-14 pr-[7.5rem] text-lg",
                  formState.errors.repoUrl && "border-red-500",
                )}
                {...repoRegister}
              />
              <Button
                type="submit"
                variant="default"
                className="absolute right-1 top-1 h-12 bg-primary px-8 font-medium hover:bg-primary/90"
              >
                Generate
              </Button>
            </div>
            {formState.errors.repoUrl?.message && (
              <p className="text-sm text-red-500">
                {formState.errors.repoUrl.message}
              </p>
            )}
            <div className="flex justify-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setTemplateModalOpen(true)}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Choose Template
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setFileExclusionModalOpen(true)}
                className="flex items-center gap-2"
              >
                <MinusCircle className="h-4 w-4" />
                Exclude Files
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCustomInstructionsModalOpen(true)}
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Custom Instructions
              </Button>
            </div>
          </div>
        </form>
      </div>
      {/* {recentReadmes && <RecentReadmes readmes={recentReadmes.readmes} />} */}
      <div className="h-12" /> {/* Add bottom spacing */}
      <TemplateModal
        open={templateModalOpen}
        onOpenChange={setTemplateModalOpen}
        selectedTemplate={selectedTemplate}
        onTemplateSelect={setSelectedTemplate}
        templateContent={templateContent}
        onTemplateContentChange={setTemplateContent}
      />
      <FileExclusionModal
        open={fileExclusionModalOpen}
        onOpenChange={setFileExclusionModalOpen}
        largeFiles={largeFiles ?? []}
        onExclude={setExcludePatterns}
        excludePatterns={excludePatterns}
      />
      <CustomInstructionsModal
        open={customInstructionsModalOpen}
        onOpenChange={setCustomInstructionsModalOpen}
        additionalContext={additionalContext}
        onAdditionalContextChange={setAdditionalContext}
      />
      <ErrorModal
        error={readmeGenerationError}
        open={errorModalOpen}
        onOpenChange={setErrorModalOpen}
        actionButton={
          readmeGenerationError?.type === ErrorType.RATE_LIMIT && !session
            ? {
                label: "Sign in",
                href: "/signin",
              }
            : undefined
        }
      />
    </div>
  );
}
