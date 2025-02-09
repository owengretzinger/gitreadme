"use client";

import { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import { type ViewMode } from "~/components/view-mode-toggle";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { GenerationState } from "~/hooks/use-readme-form";
import { Button } from "~/components/ui/button";
import { ReadmeLayout } from "~/components/readme/readme-layout";

export default function SharedReadmePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const repoPath = Array.isArray(params.repoPath) 
    ? params.repoPath.join("/") 
    : params.repoPath!;
  const [viewMode, setViewMode] = useState<ViewMode>("preview");
  const [activeTab, setActiveTab] = useState("readme");
  
  // Get the version from the URL search params
  const version = searchParams.get("v") ? parseInt(searchParams.get("v")!) : undefined;

  const { data: readme, isLoading: readmeLoading, isPending: readmePending } = api.readme.getByRepoPath.useQuery(
    { repoPath, version },
    {
      retry: false,
      refetchOnWindowFocus: false,
      enabled: !!version,
    }
  );

  const { data: mostRecentVersion, isLoading: mostRecentVersionLoading } = api.readme.getMostRecentVersion.useQuery(
    { repoPath },
    {
      retry: false,
      refetchOnWindowFocus: false,
      enabled: !version,
    }
  );

  // Redirect to URL with version if not present
  useEffect(() => {
    if (!version && mostRecentVersion) {
      const latestVersion = mostRecentVersion?.version;
      router.replace(`/readme/${repoPath}?v=${latestVersion}`);
    }
  }, [version, repoPath, router, mostRecentVersion?.version, mostRecentVersion]);

  const isLoading = readmeLoading || mostRecentVersionLoading || readmePending;

  if (isLoading) {
    return (
      <div className="p-4 md:p-8">
        <h1 className="mb-4 text-4xl font-bold">README</h1>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span>Loading README...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!readme) {
    return (
      <div className="p-4 md:p-8">
        <h1 className="mb-4 text-4xl font-bold">README</h1>
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
          <h2 className="text-2xl font-bold">README not found</h2>
          <p className="max-w-md text-muted-foreground text-center">
          {repoPath} version {version} could not be found. <br />
            It may have been deleted or never existed.
          </p>
          <Button
            onClick={() => router.push("/readme")}
            className="w-64"
          >
            Generate a README
          </Button>
        </div>
      </div>
    );
  }

  const settingsContent = (
    <div className="text-center text-muted-foreground w-full">
      <Button onClick={() => router.push("/readme")} className="w-full">
        Generate a New README
      </Button>
    </div>
  );

  return (
    <ReadmeLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      readmeViewMode={viewMode}
      setReadmeViewMode={setViewMode}
      repoPath={repoPath}
      version={version ?? readme.version}
      createdAt={readme.createdAt}
      currentUrl={window.location.href}
      generatedReadme={readme.content}
      generationState={GenerationState.IDLE}
      settingsContent={settingsContent}
    />
  );
} 