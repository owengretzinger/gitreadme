"use client";

import { Suspense, useState, useCallback } from "react";
import { useReadmeForm } from "~/hooks/use-readme-form";
import { Toaster } from "~/components/ui/toaster";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
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
import { GeneratedReadme } from "~/components/readme/generated-readme";

function ReadmeForm() {
  const [activeTab, setActiveTab] = useState("settings");
  const [readmeViewMode, setReadmeViewMode] = useState<ViewMode>("preview");
  const [templateViewMode, setTemplateViewMode] = useState<ViewMode>("preview");
  const [isAdditionalContextOpen, setIsAdditionalContextOpen] = useState(false);

  const handleSuccess = useCallback(() => {
    setActiveTab("readme");
  }, []);

  const {
    form,
    generatedReadme,
    isLoading,
    isStreaming,
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
  } = useReadmeForm(handleSuccess);

  return (
    <div className="p-8">
      <h1 className="mb-8 text-4xl font-bold">README Generator</h1>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="settings">
            <span>Generation Settings</span>
          </TabsTrigger>
          <TabsTrigger value="readme">
            <span>Generated README</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-4">
          <div className="space-y-4">
            <UrlForm
              form={form}
              isLoading={isLoading}
              onSubmit={handleSubmit}
            />

            <div className="space-y-2">
              <Collapsible
                open={isAdditionalContextOpen}
                onOpenChange={setIsAdditionalContextOpen}
              >
                <CollapsibleTrigger className="flex w-full items-center justify-center gap-2 rounded-lg border p-2 text-sm hover:bg-accent">
                  <div className="flex items-center gap-2">
                    <span>Add custom instructions or upload files</span>
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
                    <div className="grid grid-cols-2 divide-x">
                      <div className="space-y-3 pr-6">
                        <AdditionalContext
                          value={additionalContext}
                          onChange={setAdditionalContext}
                        />
                      </div>

                      <div className="space-y-3 pl-6">
                        <FileUpload
                          uploadedFiles={uploadedFiles}
                          onFileChange={handleFileChange}
                          onFileDelete={handleFileDelete}
                        />
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>

            <Separator />

            <div className="grid grid-cols-2 divide-x">
              <div className="pr-6">
                <TemplateSelection
                  selectedTemplate={selectedTemplate}
                  onTemplateSelect={setSelectedTemplate}
                />
              </div>

              <div className="pl-6">
                <TemplatePreview
                  templateContent={templateContent}
                  viewMode={templateViewMode}
                  setViewMode={setTemplateViewMode}
                  onTemplateContentChange={setTemplateContent}
                />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="readme">
          <GeneratedReadme
            content={generatedReadme}
            viewMode={readmeViewMode}
            setViewMode={setReadmeViewMode}
            isStreaming={isStreaming}
          />
        </TabsContent>
      </Tabs>
      <Toaster />
    </div>
  );
}

export default function ReadmePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ReadmeForm />
    </Suspense>
  );
}
