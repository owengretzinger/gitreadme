"use client";

import { Suspense, useState, useCallback, useEffect, useRef } from "react";
import { useReadmeForm } from "~/hooks/use-readme-form";
import { Toaster } from "~/components/ui/toaster";
import { ChevronDown } from "lucide-react";
import { cn } from "~/lib/utils";
import { type ViewMode } from "~/components/view-mode-toggle";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import { Separator } from "~/components/ui/separator";
import { UrlForm } from "~/components/readme/url-form";
import { AdditionalContext } from "~/components/readme/additional-context";
import { FileUpload } from "~/components/readme/file-upload";
import { TemplateSelection } from "~/components/readme/template-selection";
import { TemplatePreview } from "~/components/readme/template-preview";
import { FileExclusion } from "~/components/readme/file-exclusion";
import { ReadmeLayout } from "~/components/readme/readme-layout";
import { api } from "~/trpc/react";
import { useSearchParams } from "next/navigation";

function ReadmeForm() {
  const [activeTab, setActiveTab] = useState("settings");
  const [readmeViewMode, setReadmeViewMode] = useState<ViewMode>("preview");
  const [templateViewMode, setTemplateViewMode] = useState<ViewMode>("preview");
  const [isAdditionalContextOpen, setIsAdditionalContextOpen] = useState(false);
  const [largeFiles, setLargeFiles] = useState<Array<{
    path: string;
    size_kb: number;
  }> | null>(null);
  const nextVersionRef = useRef<number>(1);
  const searchParams = useSearchParams();

  const handleTokenLimitExceeded = useCallback(
    (
      files: Array<{ path: string; size_kb: number }> | null,
      shouldExpandDropdown?: boolean,
    ) => {
      setLargeFiles(files);
      if (files) {
        setActiveTab("settings");
        if (shouldExpandDropdown) {
          setIsAdditionalContextOpen(true);
        }
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
  } = useReadmeForm(handleSuccess, handleTokenLimitExceeded);

  // Set initial URL from search params if provided
  useEffect(() => {
    const urlParam = searchParams.get("url");
    if (urlParam) {
      form.setValue("repoUrl", urlParam);
    }
  }, [form, searchParams]);

  const repoPath = form.getValues().repoUrl
    ? new URL(form.getValues().repoUrl).pathname.replace(/^\//, "")
    : "";

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
  }, [nextVersion]);

  const handleExcludeFiles = useCallback((paths: string[]) => {
    form.setValue("excludePatterns", paths);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    <div className="space-y-6">
      <div className="space-y-4">
        <UrlForm form={form} onSubmit={handleSubmit} />
        <div className="space-y-2">
          <Collapsible
            open={isAdditionalContextOpen}
            onOpenChange={setIsAdditionalContextOpen}
          >
            <CollapsibleTrigger className="flex w-full items-center justify-center gap-2 rounded-lg border p-2 text-sm hover:bg-accent">
              <div className="flex items-center gap-2">
                <span className="hidden md:block">
                  Exclude file paths, add custom instructions, and upload files
                </span>
                <span className="block md:hidden">More settings</span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 shrink-0 transition-transform duration-200",
                    isAdditionalContextOpen && "rotate-180",
                  )}
                />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4">
              <div className="rounded-lg bg-card">
                <div className="flex flex-col divide-y">
                  <div className="pb-6">
                    <FileExclusion
                      largeFiles={largeFiles ?? []}
                      onExclude={handleExcludeFiles}
                      excludePatterns={form.getValues().excludePatterns}
                    />
                  </div>
                  <div className="flex flex-col divide-y pt-6 md:grid md:grid-cols-2 md:divide-x md:divide-y-0">
                    <div className="space-y-3 pb-6 md:pb-0 md:pr-6">
                      <AdditionalContext
                        value={additionalContext}
                        onChange={setAdditionalContext}
                      />
                    </div>
                    <div className="space-y-3 pt-6 md:pl-6 md:pt-0">
                      <FileUpload
                        uploadedFiles={uploadedFiles}
                        onFileChange={handleFileChange}
                        onFileDelete={handleFileDelete}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>

      <Separator />

      <div className="flex flex-col divide-y md:grid md:grid-cols-2 md:divide-x md:divide-y-0">
        <div className="pb-6 md:pb-0 md:pr-6">
          <TemplateSelection
            selectedTemplate={selectedTemplate}
            onTemplateSelect={setSelectedTemplate}
          />
        </div>

        <div className="pt-6 md:pl-6 md:pt-0">
          <TemplatePreview
            templateContent={templateContent}
            viewMode={templateViewMode}
            setViewMode={setTemplateViewMode}
            onTemplateContentChange={setTemplateContent}
          />
        </div>
      </div>
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
        currentUrl={window.location.href}
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
      <ReadmeForm />
    </Suspense>
  );
}
