import { ArrowLeft } from "lucide-react";
import { Button } from "~/components/ui/button";
import { ReadmeInfoCard } from "~/components/readme/readme-info-card";
import { GeneratedReadme } from "~/components/readme/generated-readme";
import { useRouter } from "next/navigation";
import type { useReadme } from "./use-readme";

export default function ViewReadme({
  repoUrl,
  getRepoPath,
  readmeGenerationState,
  readmeContent,
  readmeGenerationError,
}: ReturnType<typeof useReadme>) {
  const router = useRouter();

  return (
    <div className="p-4 md:p-8">
      <h1 className="mb-4 text-4xl font-bold">README Generator</h1>

      <div className="mb-4">
        <Button
          variant="ghost"
          onClick={async () => {
            router.push("/new");
          }}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to settings
        </Button>
      </div>

      {readmeGenerationError ? (
        <div className="text-red-500">{readmeGenerationError.message}</div>
      ) : (
        <>
          <ReadmeInfoCard
            repoPath={getRepoPath() ?? "No repo path"}
            version={1}
            createdAt={new Date()}
            currentUrl={repoUrl}
          />
          {/* <div>readmeContent: {readmeContent}</div>
          <div>readmeGenerationState: {readmeGenerationState}</div> */}
          <GeneratedReadme
            content={readmeContent}
            generationState={readmeGenerationState}
          />
        </>
      )}
    </div>
  );
}
