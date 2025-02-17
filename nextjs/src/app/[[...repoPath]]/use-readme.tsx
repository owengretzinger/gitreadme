import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { templates } from "~/components/readme-templates/readme-templates";
import { useReadmeStream, GenerationState } from "./use-readme-stream";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "~/trpc/react";
import { ErrorType } from "~/types/errors";
import { useSession } from "next-auth/react";

const formSchema = z.object({
  repoUrl: z.string(),
  templateId: z.string(),
  templateContent: z.string(),
  additionalContext: z.string(),
  excludePatterns: z.array(z.string()),
});
export type ReadmeFormData = z.infer<typeof formSchema>;

const defaultFormValues: ReadmeFormData = {
  repoUrl: "",
  templateId: templates[0].id,
  templateContent: templates[0].content,
  additionalContext: "",
  excludePatterns: [
    "node_modules",
    "dist",
    "build",
    "*.log",
    "*.log.*",
    "package-lock.json",
    "yarn.lock",
    "pnpm-lock.yaml",
    "bun.lockb",
    "Gemfile.lock",
    "Gemfile.lock.*",
  ],
};

const usePersistedForm = () => {
  const queryClient = useQueryClient();
  const formKey = useMemo(() => ["readmeForm"] as const, []);

  const { data: persistedFormValues } = useQuery({
    queryKey: formKey,
    queryFn: () => defaultFormValues,
    enabled: false,
  });

  const form = useForm<ReadmeFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: persistedFormValues ?? defaultFormValues,
  });

  useEffect(() => {
    const subscription = form.watch((value) => {
      queryClient.setQueryData(formKey, value);
    });
    return () => subscription.unsubscribe();
  }, [form, formKey, queryClient]);

  return form;
};

const useFormActions = (form: ReturnType<typeof usePersistedForm>) => {
  const getRepoPath = () => {
    const url = form.watch("repoUrl");
    if (!url) return undefined;
    try {
      const urlObj = new URL(url);
      if (
        urlObj.hostname === "github.com" &&
        urlObj.pathname.split("/").length >= 3
      ) {
        return urlObj.pathname.slice(1);
      }
    } catch {
      // Return undefined if URL is invalid
      return undefined;
    }
    return undefined;
  };

  return {
    repoUrl: form.watch("repoUrl"),
    setRepoUrl: (url: string) => form.setValue("repoUrl", url),
    getRepoPath,
    setRepoUrlFromPath: (path: string) => {
      form.setValue("repoUrl", `https://github.com/${path}`);
    },
    repoRegister: form.register("repoUrl"),
    selectedTemplate: form.watch("templateId"),
    setSelectedTemplate: (templateId: string) => {
      form.setValue("templateId", templateId);
      form.setValue(
        "templateContent",
        templates.find((t) => t.id === templateId)!.content,
      );
    },
    templateContent: form.watch("templateContent"),
    setTemplateContent: (content: string) =>
      form.setValue("templateContent", content),
    additionalContext: form.watch("additionalContext"),
    setAdditionalContext: (context: string) =>
      form.setValue("additionalContext", context),
    excludePatterns: form.watch("excludePatterns"),
    setExcludePatterns: (patterns: string[]) =>
      form.setValue("excludePatterns", patterns),
  };
};

const useReadmeGeneration = (
  form: ReturnType<typeof usePersistedForm>,
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
  const incrementRateLimit = api.readme.incrementRateLimit.useMutation();

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

    // Increment rate limit
    void incrementRateLimit.mutateAsync().then(() => {
      void utils.readme.getRateLimit.invalidate();
    });

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

interface ResetStateProps {
  form: ReturnType<typeof usePersistedForm>;
  setGenerationState: (state: GenerationState) => void;
  setReadmeContent: (content: string) => void;
  setReadmeGenerationError: (error: null) => void;
  setErrorModalOpen: (open: boolean) => void;
}
const useResetState = ({
  form,
  setGenerationState,
  setReadmeContent,
  setReadmeGenerationError,
  setErrorModalOpen,
}: ResetStateProps) => {
  const queryClient = useQueryClient();
  const { status } = useSession();

  const resetStates = async () => {
    // Reset form to default values
    form.reset(defaultFormValues);

    // Reset generation state
    setGenerationState(GenerationState.NOT_STARTED);
    setReadmeContent("");
    setReadmeGenerationError(null);
    setErrorModalOpen(false);

    // Clear all query caches
    await queryClient.invalidateQueries();
    await queryClient.resetQueries();
  };

  // Only reset when auth status changes (not on every session change)
  useEffect(() => {
    void resetStates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  return {
    resetStates,
  };
};

export const useReadme = () => {
  const form = usePersistedForm();
  const formActions = useFormActions(form);
  const generation = useReadmeGeneration(form, formActions.getRepoPath);
  const {
    generationState,
    readmeContent,
    generationError,
    setGenerationState,
    setReadmeContent,
    setReadmeGenerationError,
    errorModalOpen,
    setErrorModalOpen,
  } = useReadmeStream();

  useResetState({
    form,
    setGenerationState,
    setReadmeContent,
    setReadmeGenerationError,
    setErrorModalOpen,
  });

  // Add query to get latest version if none provided
  const { data: latestVersion } = api.readme.getMostRecentVersion.useQuery(
    { repoPath: formActions.getRepoPath() ?? "" },
    {
      enabled: !!formActions.getRepoPath() && generation.version === null,
    },
  );

  // Set the version to latest if none provided
  useEffect(() => {
    if (latestVersion && generation.version === null) {
      generation.setVersion(latestVersion.version);
    }
  }, [latestVersion, generation]);

  // Add query to load existing README
  const { data: existingReadme, isLoading: isLoadingExistingReadme } =
    api.readme.getByRepoPath.useQuery(
      {
        repoPath: formActions.getRepoPath() ?? "",
        version: generation.version ?? undefined,
      },
      {
        enabled:
          !!formActions.getRepoPath() &&
          !readmeContent &&
          generationState === GenerationState.NOT_STARTED,
      },
    );

  // Set the content from the database if it exists
  useEffect(() => {
    if (existingReadme && !readmeContent) {
      setReadmeContent(existingReadme.content);
    }
  }, [existingReadme, readmeContent, setReadmeContent]);

  const currentVersion = generation.version;

  return {
    // Form state and actions
    form,
    formState: form.formState,
    ...formActions,

    // Generation
    generateReadme: generation.generateReadme,
    readmeGenerationState: generationState,
    readmeContent,
    readmeGenerationError: generationError,
    setReadmeGenerationState: setGenerationState,
    errorModalOpen,
    setErrorModalOpen,
    version: currentVersion,
    setVersion: generation.setVersion,
    setGenerationState,
    setReadmeContent,
    setReadmeGenerationError,

    // Rate limit info
    rateLimitInfo: generation.rateLimitInfo,
    largeFiles: null,

    // Loading state
    isLoadingExistingReadme,
  };
};
