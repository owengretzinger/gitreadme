import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "~/trpc/react";
import { ErrorType } from "~/types/errors";
import { type UseFormReturn } from "react-hook-form";
import { type ReadmeFormData, formSchema } from "./types";
import { useReadmeStream } from "./use-readme-stream";
import { trackReadmeGeneration } from "~/lib/posthog";
import { templates } from "~/components/readme-templates/readme-templates";

export const useReadmeGeneration = (form: UseFormReturn<ReadmeFormData>) => {
  const router = useRouter();
  const utils = api.useUtils();
  const queryClient = useQueryClient();
  const contentKey = ["readmeContent"] as const;

  const {
    generationState,
    readmeContent,
    generateReadmeStream,
    generationError,
    errorModalOpen,
    setErrorModalOpen,
    setGenerationState,
    setReadmeGenerationError,
    handleError,
  } = useReadmeStream();

  const setReadmeContent = (content: string) =>
    queryClient.setQueryData(contentKey, content);

  // Add rate limit query
  const { data: rateLimitInfo, refetch: refetchRateLimit } =
    api.readme.getRateLimit.useQuery(undefined, {
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      staleTime: 0, // Ensure we always get fresh data
      gcTime: 0, // Don't cache the result (modern equivalent of cacheTime)
    });

  const generateReadme = async () => {
    const values = form.getValues();

    // Validate input before proceeding
    const repoUrl = values.repoUrl;
    let repoPath: string | undefined;

    // Check if input is in the format "owner/repo"
    if (/^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/.test(repoUrl)) {
      repoPath = repoUrl.toLowerCase();
    } else {
      // Try to parse as a URL
      try {
        const urlObj = new URL(repoUrl);
        if (urlObj.hostname !== "github.com") {
          form.setError("repoUrl", {
            type: "manual",
            message:
              "The URL provided is not a GitHub URL. It must start with https://github.com/",
          });
          return;
        }
        if (urlObj.pathname.split("/").length < 3) {
          form.setError("repoUrl", {
            type: "manual",
            message:
              "Could not parse the user/org and repo name. URL must be in the format https://github.com/owner/repo",
          });
          return;
        }
        repoPath = urlObj.pathname.slice(1).toLowerCase();
      } catch {
        form.setError("repoUrl", {
          type: "manual",
          message:
            "Please enter a valid GitHub URL (https://github.com/owner/repo) or repository path (owner/repo).",
        });
        return;
      }
    }

    const result = await form.trigger();
    if (!result) return;

    const parsed = formSchema.safeParse(values);
    if (!parsed.success) return;

    // Wait for rate limit info before proceeding
    let currentRateLimitInfo = rateLimitInfo;
    if (!currentRateLimitInfo) {
      try {
        // Explicitly fetch rate limit info and wait for it
        const response = await refetchRateLimit();
        currentRateLimitInfo = response.data;
      } catch (error) {
        console.error("Failed to fetch rate limit info:", error);
        // Continue without rate limit check if there's an error
      }
    }

    // Check rate limit before proceeding with valid data
    if (
      currentRateLimitInfo &&
      typeof currentRateLimitInfo.remaining === "number" &&
      currentRateLimitInfo.remaining <= 0
    ) {
      handleError({
        type: ErrorType.RATE_LIMIT,
        message:
          "You have reached your daily limit. Please sign in if you haven't already to get 15 free generations per day, or try again tomorrow.",
      });
      return;
    }

    try {
      // Navigate directly to the repo path
      router.push(`/${repoPath}`);

      trackReadmeGeneration({
        repo_path: repoPath,
        template_id: values.templateId,
        edited_template:
          values.templateContent !==
          templates.find((t) => t.id === values.templateId)?.content,
        added_additional_context:
          !!values.additionalContext &&
          values.additionalContext.trim().length > 0,
      });

      return generateReadmeStream.mutateAsync({
        repoUrl: repoPath.includes("github.com") ? values.repoUrl : `https://github.com/${repoPath}`,
        templateContent: values.templateContent,
        additionalContext: values.additionalContext,
        excludePatterns: values.excludePatterns,
      });
    } catch (error) {
      console.error(error);
      // Rate limit will be refunded by the server if needed
      await utils.readme.getRateLimit.invalidate();
    }
  };

  return {
    generateReadme,
    generationState,
    readmeContent,
    readmeGenerationError: generationError,
    errorModalOpen,
    setErrorModalOpen,
    rateLimitInfo,
    setReadmeContent,
    setGenerationState,
    setReadmeGenerationError,
  };
};
