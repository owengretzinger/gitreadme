import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "~/trpc/react";
import { ErrorType } from "~/types/errors";
import { type UseFormReturn } from "react-hook-form";
import { type ReadmeFormData, formSchema } from "./types";
import { useReadmeStream } from "./use-readme-stream";

export const useReadmeGeneration = (
  form: UseFormReturn<ReadmeFormData>,
  getRepoPath: () => string | undefined,
) => {
  const router = useRouter();
  const utils = api.useUtils();
  const queryClient = useQueryClient();
  const versionKey = ["readmeVersion"] as const;
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
  } = useReadmeStream();

  const { data: version = null } = useQuery({
    queryKey: versionKey,
    queryFn: () => null as number | null,
    enabled: false,
  });

  const setVersion = (version: number | null) =>
    queryClient.setQueryData(versionKey, version);

  const setReadmeContent = (content: string) =>
    queryClient.setQueryData(contentKey, content);

  // Add rate limit query
  const { data: rateLimitInfo } = api.readme.getRateLimit.useQuery(undefined, {
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  // Add mutation to get next version
  const getNextVersion = api.readme.getNextVersion.useMutation();

  const generateReadme = async () => {
    const values = form.getValues();

    // Validate URL before proceeding
    try {
      const urlObj = new URL(values.repoUrl);
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
            "Could not parse the user/org and repo name. URL must be in the format https://github.com/username/repo",
        });
        return;
      }
    } catch {
      form.setError("repoUrl", {
        type: "manual",
        message:
          "Your input is not a URL. Please enter a valid GitHub repo URL.",
      });
      return;
    }

    const result = await form.trigger();
    if (!result) return;

    const parsed = formSchema.safeParse(values);
    if (!parsed.success) return;

    // Check rate limit before proceeding
    if (rateLimitInfo && rateLimitInfo.remaining <= 0) {
      const errorMessage = rateLimitInfo.isAuthenticated
        ? `You have reached your daily limit of ${rateLimitInfo.total} generations. Please try again tomorrow.`
        : `Please sign in to get 20 free generations per day.`;

      setReadmeGenerationError({
        type: ErrorType.RATE_LIMIT,
        message: errorMessage,
      });
      setErrorModalOpen(true);
      return;
    }

    try {
      // Navigate immediately
      const repoPath = values.repoUrl.split("github.com/")[1];
      router.push(`/${repoPath}`);

      // Start these operations in parallel but don't block on them
      void getNextVersion
        .mutateAsync({
          repoPath: getRepoPath()!,
        })
        .then((nextVersion) => {
          setVersion(nextVersion);
          // Start streaming with the version
          return generateReadmeStream.mutateAsync({
            repoUrl: values.repoUrl,
            templateContent: values.templateContent,
            additionalContext: values.additionalContext,
            excludePatterns: values.excludePatterns,
            version: nextVersion,
          });
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
    version,
    setVersion,
    setReadmeContent,
    setGenerationState,
    setReadmeGenerationError,
  };
};
