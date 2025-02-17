import { LayoutTemplate, MinusCircle, Settings } from "lucide-react";
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
import { RecentReadmes } from "~/components/readme/recent-readmes";
import { api } from "~/trpc/react";

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
  const { data: recentReadmes } = api.readme.getRecentReadmes.useQuery();

  return (
    <div className="mx-auto mt-10 w-full max-w-4xl space-y-8">
      <div className="space-y-10">
        <div className="flex justify-center">
          <RateLimitInfo rateLimitInfo={rateLimitInfo} status={status} />
        </div>
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-center text-4xl font-bold">README Generator</h1>
          <p className="text-center text-lg text-muted-foreground">
            Generate a README for your GitHub repository using AI that
            understands your entire codebase.
          </p>
        </div>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setGenerationState(GenerationState.CONTACTING_SERVER);
            await generateReadme();
          }}
        >
          <div className="flex flex-col gap-1">
            <div className="relative flex">
              <Input
                placeholder="https://github.com/username/repo"
                className={cn(
                  "pb-20 pl-4 pt-6 rounded-2xl",
                  formState.errors.repoUrl && "border-red-500",
                )}
                {...repoRegister}
              />
              <Button
                type="submit"
                variant="default"
                className="absolute right-3 top-3 h-8 w-8 bg-primary p-0 rounded-xl hover:bg-primary/90"
              >
                <span className="sr-only">Generate</span>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 4L12 20M12 4L18 10M12 4L6 10"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Button>
              <div className="absolute bottom-3 left-3 flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setTemplateModalOpen(true)}
                  className="flex items-center gap-2 text-muted-foreground rounded-xl"
                >
                  <LayoutTemplate className="h-4 w-4" />
                  Choose Template
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setFileExclusionModalOpen(true)}
                  className="flex items-center gap-2 text-muted-foreground rounded-xl"
                >
                  <MinusCircle className="h-4 w-4" />
                  Exclude Files
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCustomInstructionsModalOpen(true)}
                  className="flex items-center gap-2 text-muted-foreground rounded-xl"
                >
                  <Settings className="h-4 w-4" />
                  Custom Instructions
                </Button>
              </div>
            </div>
            {formState.errors.repoUrl?.message && (
              <p className="text-sm text-red-500">
                {formState.errors.repoUrl.message}
              </p>
            )}
          </div>
        </form>
        {recentReadmes && recentReadmes.length > 0 && (
          <RecentReadmes readmes={recentReadmes} />
        )}
      </div>
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
