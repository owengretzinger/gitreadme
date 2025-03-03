import {
  ArrowUp,
  LayoutTemplate,
  MinusCircle,
  Settings,
  Youtube,
} from "lucide-react";
import { useState, useEffect } from "react";
import { CustomInstructionsModal } from "~/components/readme/modals/custom-instructions-modal";
import { FileExclusionModal } from "~/components/readme/modals/file-exclusion-modal";
import { TemplateModal } from "~/components/readme/modals/template-modal";
import { ErrorModal } from "~/components/readme/modals/error-modal";
import { VideoTutorialModal } from "~/components/readme/modals/video-tutorial-modal";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { type useReadme } from "../../hooks/use-readme";
import { cn } from "~/lib/utils";
import { RateLimitInfo } from "~/components/readme/rate-limit-info";
import { useSession } from "next-auth/react";
import { ErrorType } from "~/types/errors";
import { GenerationState } from "../../hooks/use-readme-helpers/use-readme-stream";
import { RecentReadmes } from "~/components/readme/recent-readmes";
import Image from "next/image";

export default function GenerationSettings({
  formState,
  repoRegister,
  repoUrl,
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
  setReadmeGenerationError,
}: ReturnType<typeof useReadme>) {
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [fileExclusionModalOpen, setFileExclusionModalOpen] = useState(false);
  const [customInstructionsModalOpen, setCustomInstructionsModalOpen] =
    useState(false);
  const [videoTutorialModalOpen, setVideoTutorialModalOpen] = useState(false);
  const { data: session, status } = useSession();

  // Auto-open file exclusion modal when we get a token limit error
  useEffect(() => {
    if (readmeGenerationError?.type === ErrorType.TOKEN_LIMIT) {
      setFileExclusionModalOpen(true);
    }
  }, [readmeGenerationError, setErrorModalOpen]);

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="mt-4 flex flex-col gap-10 sm:mt-10">
        <div className="flex flex-col items-center gap-4">
          <div className="flex justify-center">
            <div
              className="group flex cursor-pointer items-center gap-1.5 rounded-md bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-500 transition-all hover:scale-[1.06]"
              onClick={() => setVideoTutorialModalOpen(true)}
            >
              <Youtube className="h-4 w-4" />
              <span className="">Watch Tutorial</span>
            </div>
          </div>
          <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-4">
            <h1 className="text-pretty text-center text-3xl font-bold sm:text-4xl">
              Repository to README
            </h1>
          </div>
          <p className="text-pretty text-center text-muted-foreground">
            Instantly generate high-quality README files using AI that looks at
            your <br className="hidden md:block" />
            entire codebase to automatically recognize key features,
            installation instructions, and more. <br className="hidden md:block" />
            Enter a GitHub URL or just the repository path (e.g., owner/repo).
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
                placeholder="https://github.com/owner/repo, or owner/repo"
                className={cn(
                  "rounded-2xl pb-28 pl-4 pr-[52px] pt-7",
                  formState.errors.repoUrl && "border-red-500",
                )}
                {...repoRegister}
              />
              <Button
                type="submit"
                variant="default"
                className="absolute right-3 top-3 h-8 w-8 rounded-xl bg-primary p-0 hover:bg-primary/90"
                disabled={!repoUrl || formState.isSubmitting}
              >
                <span className="sr-only">Generate</span>
                <ArrowUp />
              </Button>
              <div className="absolute bottom-3 left-3 flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setTemplateModalOpen(true)}
                  className="flex items-center gap-2 rounded-xl text-muted-foreground"
                >
                  <LayoutTemplate className="h-4 w-4" />
                  <span className="hidden md:inline">Choose Template</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setFileExclusionModalOpen(true)}
                  className="flex items-center gap-2 rounded-xl text-muted-foreground"
                >
                  <MinusCircle className="h-4 w-4" />
                  <span className="hidden md:inline">Exclude Files</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCustomInstructionsModalOpen(true)}
                  className="flex items-center gap-2 rounded-xl text-muted-foreground"
                >
                  <Settings className="h-4 w-4" />
                  <span className="hidden md:inline">Custom Instructions</span>
                </Button>
              </div>
              <div className="absolute bottom-3 right-3 hidden lg:block">
                <RateLimitInfo rateLimitInfo={rateLimitInfo} status={status} />
              </div>
            </div>
            {formState.errors.repoUrl?.message && (
              <p className="text-sm text-red-500">
                {formState.errors.repoUrl.message}
              </p>
            )}
            <div className="mx-auto mt-1 lg:hidden">
              <RateLimitInfo rateLimitInfo={rateLimitInfo} status={status} />
            </div>
          </div>
        </form>
        <RecentReadmes />
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
        onOpenChange={(open) => {
          setFileExclusionModalOpen(open);
          if (!open) setReadmeGenerationError(null);
        }}
        largeFiles={largeFiles ?? []}
        onExclude={setExcludePatterns}
        excludePatterns={excludePatterns}
        generationError={readmeGenerationError}
      />
      <CustomInstructionsModal
        open={customInstructionsModalOpen}
        onOpenChange={setCustomInstructionsModalOpen}
        additionalContext={additionalContext}
        onAdditionalContextChange={setAdditionalContext}
      />
      <ErrorModal
        error={readmeGenerationError}
        open={
          errorModalOpen &&
          readmeGenerationError?.type !== ErrorType.TOKEN_LIMIT
        }
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
      <VideoTutorialModal
        open={videoTutorialModalOpen}
        onOpenChange={setVideoTutorialModalOpen}
      />
    </div>
  );
}
