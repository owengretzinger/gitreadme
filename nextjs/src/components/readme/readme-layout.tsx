import { type ViewMode } from "~/components/view-mode-toggle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { GeneratedReadme } from "./generated-readme";
import { ReadmeInfoCard } from "./readme-info-card";
import { GenerationState } from "~/hooks/use-readme-form";
import { type ReactNode } from "react";

interface ReadmeLayoutProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  readmeViewMode: ViewMode;
  setReadmeViewMode: (mode: ViewMode) => void;
  repoPath: string;
  version: number;
  createdAt: Date | null;
  currentUrl: string;
  generatedReadme: string | null;
  generationState: GenerationState;
  settingsContent: ReactNode;
}

export function ReadmeLayout({
  activeTab,
  setActiveTab,
  readmeViewMode,
  setReadmeViewMode,
  repoPath,
  version,
  createdAt,
  currentUrl,
  generatedReadme,
  generationState,
  settingsContent,
}: ReadmeLayoutProps) {
  return (
    <div className="p-4 md:p-8">
      <h1 className="mb-4 text-4xl font-bold">README Generator</h1>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex w-full justify-center md:justify-start">
          <TabsList>
            <TabsTrigger value="settings">
              <span>Generation Settings</span>
            </TabsTrigger>
            <TabsTrigger value="readme">
              <span>Generated README</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="settings">
          {settingsContent}
        </TabsContent>

        <TabsContent value="readme">
          {generatedReadme && generationState === GenerationState.IDLE && (
            <>
              <ReadmeInfoCard
                repoPath={repoPath}
                version={version}
                createdAt={createdAt}
                currentUrl={currentUrl}
              />
              <GeneratedReadme
                content={generatedReadme}
                viewMode={readmeViewMode}
                setViewMode={setReadmeViewMode}
                generationState={generationState}
              />
            </>
          )}
          {generationState !== GenerationState.IDLE && (
            <>
              <ReadmeInfoCard
                repoPath={repoPath}
                version={version}
                createdAt={createdAt}
                currentUrl={currentUrl}
              />
              <GeneratedReadme
                content={generatedReadme ?? ""}
                viewMode={readmeViewMode}
                setViewMode={setReadmeViewMode}
                generationState={generationState}
              />
            </>
          )}
          {!generatedReadme && generationState === GenerationState.IDLE && (
            <div className="text-center text-muted-foreground">
              Generate a README first
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 