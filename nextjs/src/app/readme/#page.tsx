"use client";

import { Suspense, useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useReadmeForm } from "~/hooks/use-readme-form";
import { type ViewMode } from "~/components/view-mode-toggle";
import { api } from "~/trpc/react";
import { useSearchParams } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "~/components/ui/toaster";
import { ReadmeLayout } from "~/components/readme/readme-layout";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { FileText, Settings, MinusCircle } from "lucide-react";
import { TemplateModal } from "~/components/readme/modals/template-modal";
import { FileExclusionModal } from "~/components/readme/modals/file-exclusion-modal";
import { CustomInstructionsModal } from "~/components/readme/modals/custom-instructions-modal";
import { RecentReadmes } from "~/components/readme/recent-readmes";
import { useSession } from "next-auth/react";
import { RateLimitInfo } from "~/components/readme/rate-limit-info";

type ActiveTab = "settings" | "readme";

function ReadmeForm() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("settings");
  const [readmeViewMode, setReadmeViewMode] = useState<ViewMode>("preview");
  const [templateViewMode, setTemplateViewMode] = useState<ViewMode>("preview");
  const [largeFiles, setLargeFiles] = useState<Array<{
    path: string;
    size_kb: number;
  }> | null>(null);
  const nextVersionRef = useRef<number>(1);
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  // Modal states
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [fileExclusionModalOpen, setFileExclusionModalOpen] = useState(false);
  const [customInstructionsModalOpen, setCustomInstructionsModalOpen] = useState(false);

  const handleTokenLimitExceeded = useCallback(
    (
      files: Array<{ path: string; size_kb: number }> | null,
      shouldExpandDropdown?: boolean,
    ) => {
      setLargeFiles(files);
      setActiveTab("settings");
      if (files && shouldExpandDropdown) {
        setFileExclusionModalOpen(true);
      }
    },
    [],
  );

  const handleSuccess = useCallback((repoPath: string) => {
    setActiveTab("readme");
    // Update URL without full page reload, using unencoded path and include version
    window.history.pushState(
      {},
      "",
      `/readme/${repoPath}?v=${nextVersionRef.current}`,
    );
  }, []);

  const {
    form,
    generatedReadme,
    selectedTemplate,
    setSelectedTemplate,
    additionalContext,
    setAdditionalContext,
    uploadedFiles,
    templateContent,
    setTemplateContent,
    handleSubmit,
    handleFileChange,
    handleFileDelete,
    generationState,
    rateLimitInfo,
  } = useReadmeForm(handleSuccess, handleTokenLimitExceeded, setActiveTab);

  const { data: recentReadmes } = api.dashboard.getUserData.useQuery(undefined, {
    enabled: !!session,
  });

  // Set initial URL from search params if provided
  useEffect(() => {
    const urlParam = searchParams.get("url");
    if (urlParam) {
      form.setValue("repoUrl", urlParam);
    }
  }, [form, searchParams]);

  const repoPath = useMemo(() => 
    form.getValues().repoUrl
      ? new URL(form.getValues().repoUrl).pathname.replace(/^\//, "")
      : "",
    [form]
  );

  const { data: nextVersion } = api.readme.getNextVersion.useQuery(
    { repoPath },
    {
      enabled: !!repoPath,
    },
  );

  // Update the ref when nextVersion changes
  useEffect(() => {
    if (nextVersion) {
      nextVersionRef.current = nextVersion;
    }
    console.log("Next version:", nextVersion);
  }, [nextVersion]);

  const handleExcludeFiles = useCallback((paths: string[]) => {
    form.setValue("excludePatterns", paths);
  }, [form]);

  // Handle back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === "/readme") {
        setActiveTab("settings");
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const settingsContent = (
    <div className="mx-auto w-full max-w-4xl space-y-8 mt-24">
      <div className="space-y-4">
        {rateLimitInfo && (
          <div className="flex justify-center">
            <RateLimitInfo rateLimitInfo={rateLimitInfo} session={session} />
          </div>
        )}
        <h1 className="text-center text-4xl font-bold mt-4">README Generator</h1>
        <p className="text-center text-lg text-muted-foreground">
          Generate a comprehensive README for your GitHub repository powered by AI.
        </p>
      </div>

      <div className="space-y-6">
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Input
                placeholder="Enter repository URL..."
                className="h-14 pr-[7.5rem] text-lg"
                {...form.register("repoUrl")}
              />
              <Button 
                type="submit" 
                variant="default"
                className="absolute right-1 top-1 h-12 px-8 font-medium bg-primary hover:bg-primary/90"
              >
                Generate
              </Button>
            </div>
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

      {recentReadmes && <RecentReadmes readmes={recentReadmes.readmes} />}

      <div className="h-12" /> {/* Add bottom spacing */}

      <TemplateModal
        open={templateModalOpen}
        onOpenChange={setTemplateModalOpen}
        selectedTemplate={selectedTemplate}
        onTemplateSelect={setSelectedTemplate}
        templateContent={templateContent}
        viewMode={templateViewMode}
        setViewMode={setTemplateViewMode}
        onTemplateContentChange={setTemplateContent}
      />

      <FileExclusionModal
        open={fileExclusionModalOpen}
        onOpenChange={setFileExclusionModalOpen}
        largeFiles={largeFiles ?? []}
        onExclude={handleExcludeFiles}
        excludePatterns={form.getValues().excludePatterns}
      />

      <CustomInstructionsModal
        open={customInstructionsModalOpen}
        onOpenChange={setCustomInstructionsModalOpen}
        additionalContext={additionalContext}
        onAdditionalContextChange={setAdditionalContext}
        uploadedFiles={uploadedFiles}
        onFileChange={handleFileChange}
        onFileDelete={handleFileDelete}
      />
    </div>
  );

  return (
    <>
      <ReadmeLayout
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        readmeViewMode={readmeViewMode}
        setReadmeViewMode={setReadmeViewMode}
        repoPath={repoPath}
        version={nextVersion ?? 1}
        createdAt={new Date()}
        currentUrl={typeof window !== "undefined" ? window.location.href : ""}
        generatedReadme={generatedReadme}
        generationState={generationState}
        settingsContent={settingsContent}
      />
      <Toaster />
    </>
  );
}

export default function ReadmePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SessionProvider>
        <ReadmeForm />
      </SessionProvider>
    </Suspense>
  );
}
