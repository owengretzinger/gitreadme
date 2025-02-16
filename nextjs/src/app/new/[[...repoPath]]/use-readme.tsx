import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { templates } from "~/components/readme-templates/readme-templates";
import { useReadmeStream } from "./use-readme-stream";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "~/trpc/react";
import { ErrorType } from "~/types/errors";
import { type RateLimitInfo } from "~/hooks/use-readme-form";

const formSchema = z.object({
  repoUrl: z.string().refine((url) => {
    try {
      const parsed = new URL(url);
      return (
        parsed.hostname === "github.com" &&
        parsed.pathname.split("/").length >= 3
      );
    } catch {
      return false;
    }
  }, "Please enter a valid GitHub repo URL"),
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
    const urlObj = new URL(url);
    return urlObj.pathname.slice(1);
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

const useReadmeGeneration = (form: ReturnType<typeof usePersistedForm>) => {
  const router = useRouter();
  const utils = api.useUtils();
  const {
    generationState,
    readmeContent,
    generateReadmeStream,
    generationError,
    errorModalOpen,
    setErrorModalOpen,
    setReadmeGenerationError,
  } = useReadmeStream();

  // Add rate limit query
  const { data: rateLimitInfo } = api.readme.getRateLimit.useQuery(undefined, {
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  // Add mutation to start generation and get updated rate limit
  const startGeneration = api.readme.startGeneration.useMutation({
    onSuccess: (newRateLimit: RateLimitInfo) => {
      utils.readme.getRateLimit.setData(undefined, () => newRateLimit);
    },
  });

  const generateReadme = async () => {
    const result = await form.trigger();
    if (!result) return;

    const values = form.getValues();
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

    const mutationInput = {
      repoUrl: values.repoUrl,
      templateContent: values.templateContent,
      additionalContext: values.additionalContext,
      excludePatterns: values.excludePatterns,
    };

    try {
      // First start the generation to update rate limit
      void startGeneration.mutateAsync();

      // Then start streaming
      const promise = generateReadmeStream.mutateAsync(mutationInput);
      router.push(`/new/${values.repoUrl.split("github.com/")[1]}`);
      await promise;
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
  };
};

export const useReadme = () => {
  const form = usePersistedForm();
  const formActions = useFormActions(form);
  const generation = useReadmeGeneration(form);

  return {
    // Form state and actions
    form,
    formState: form.formState,
    ...formActions,

    // Generation
    ...generation,
    readmeGenerationState: generation.generationState,
    readmeGenerationError: generation.readmeGenerationError,
    errorModalOpen: generation.errorModalOpen,
    setErrorModalOpen: generation.setErrorModalOpen,

    // Rate limit info
    rateLimitInfo: generation.rateLimitInfo,
    largeFiles: null,
  };
};
