import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { api } from "~/trpc/react";
import { useToast } from "./use-toast";
import { templates } from "~/components/readme-templates/readme-templates";
import {
  type ApiErrorResponse,
  isRateLimitError,
  isTokenLimitError,
} from "~/types/errors";
import {
  trackReadmeGeneration,
  trackGenerationError,
  trackTemplateSelect,
  trackRateLimit,
} from "~/lib/posthog";

export interface RateLimitInfo {
  remaining: number;
  total: number;
  used: number;
  isAuthenticated: boolean;
}

export enum GenerationState {
  IDLE = "IDLE",
  CONTACTING_SERVER = "CONTACTING_SERVER",
  PACKING_REPOSITORY = "PACKING_REPOSITORY",
  WAITING_FOR_AI = "WAITING_FOR_AI",
  STREAMING = "STREAMING",
}

const formSchema = z.object({
  repoUrl: z.string().url("Please enter a valid URL"),
  templateContent: z.string(),
  additionalContext: z.string(),
  excludePatterns: z.array(z.string()),
});
export type ReadmeFormData = z.infer<typeof formSchema>;

type ActiveTab = "settings" | "readme";

export const useReadmeForm = (
  onSuccess?: (repoPath: string) => void,
  onTokenLimitExceeded?: (
    files: Array<{ path: string; size_kb: number }> | null,
    shouldExpandDropdown?: boolean,
  ) => void,
  setActiveTab?: (tab: ActiveTab) => void,
) => {
  const [generatedReadme, setGeneratedReadme] = useState<string | null>(null);
  const [generationState, setGenerationState] = useState<GenerationState>(
    GenerationState.IDLE,
  );
  const [selectedTemplate, setSelectedTemplate] = useState("owen");
  const [additionalContext, setAdditionalContext] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<FileList | null>(null);
  const [templateContent, setTemplateContent] = useState(templates[0].content);
  const [rateLimitInfo, setRateLimitInfo] = useState<RateLimitInfo | null>(null);
  const [nextVersion, setNextVersion] = useState(1);
  const { toast } = useToast();

  const form = useForm<ReadmeFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      repoUrl: "",
      templateContent: templates[0]?.content ?? "",
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
    },
  });

  // Get next version number
  const { data: versionData } = api.readme.getNextVersion.useQuery(
    { repoPath: form.getValues().repoUrl ? new URL(form.getValues().repoUrl).pathname.replace(/^\//, "") : "" },
    { enabled: !!form.getValues().repoUrl }
  );

  useEffect(() => {
    if (versionData) {
      setNextVersion(versionData);
    }
  }, [versionData]);

  // Get initial rate limit info
  const { data: initialRateLimit } = api.readme.getRateLimit.useQuery(
    undefined,
    {
      refetchOnWindowFocus: false,
    },
  );

  // Update rate limit info when it changes
  useEffect(() => {
    if (initialRateLimit) {
      setRateLimitInfo(initialRateLimit);
    }
  }, [initialRateLimit]);

  useEffect(() => {
    if (templates.length === 0) return;
    const template =
      templates.find((t) => t.id === selectedTemplate) ?? templates[0];
    setTemplateContent(template.content);
  }, [selectedTemplate]);

  // Track template changes
  useEffect(() => {
    if (selectedTemplate) {
      trackTemplateSelect({
        template_id: selectedTemplate,
      });
    }
  }, [selectedTemplate]);

  const generateReadmeStream = api.readme.generateReadmeStream.useMutation({
    onMutate: () => {
      setGenerationState(GenerationState.CONTACTING_SERVER);
      setGeneratedReadme("");
      const repoPath = new URL(form.getValues().repoUrl).pathname.replace(
        /^\//,
        "",
      );
      if (onSuccess) onSuccess(repoPath);

      // Track generation start
      trackReadmeGeneration({
        repo_path: repoPath,
        template_id: selectedTemplate,
        has_additional_context: additionalContext.length > 0,
        has_uploaded_files: uploadedFiles !== null,
        exclude_patterns: form.getValues().excludePatterns,
        generation_state: GenerationState.CONTACTING_SERVER,
        version: nextVersion,
      });
    },
    onSuccess: async (stream) => {
      try {
        setGenerationState(GenerationState.PACKING_REPOSITORY);
        let hasStartedStreaming = false;
        const startTime = performance.now();

        for await (const chunk of stream) {
          if (chunk === "DONE_PACKING") {
            setGenerationState(GenerationState.WAITING_FOR_AI);
          } else if (chunk.startsWith("ERROR:")) {
            const error = JSON.parse(
              chunk.replace("ERROR:", ""),
            ) as ApiErrorResponse;

            if (isTokenLimitError(error)) {
              if (onTokenLimitExceeded) {
                onTokenLimitExceeded(error.largest_files, true);
              }
              setGenerationState(GenerationState.IDLE);
              trackGenerationError({
                type: "token_limit",
                message: error.message,
                repo_path: new URL(form.getValues().repoUrl).pathname.replace(/^\//, ""),
                details: {
                  largest_files: error.largest_files,
                },
              });
              toast({
                variant: "destructive",
                title: "Repository Too Large",
                description: error.message,
              });
              return;
            }

            if (isRateLimitError(error)) {
              setRateLimitInfo(error.info);
              setGenerationState(GenerationState.IDLE);
              trackRateLimit({
                limit_type: error.info.isAuthenticated ? "authenticated" : "unauthenticated",
                current_count: error.info.used,
                limit: error.info.total,
              });
              toast({
                variant: "destructive",
                title: "Rate limit exceeded",
                description: error.message,
              });
              const encodedMessage = encodeURIComponent(error.message);
              window.location.href = `/signin?error=rate_limit&message=${encodedMessage}`;
              return;
            }

            // Handle other error types
            setGenerationState(GenerationState.IDLE);
            trackGenerationError({
              type: "server_error",
              message: error.message,
              repo_path: new URL(form.getValues().repoUrl).pathname.replace(/^\//, ""),
            });
            toast({
              variant: "destructive",
              title: "Error",
              description: error.message,
            });
            if (setActiveTab) {
              setActiveTab("settings");
            }
            return;
          } else if (chunk.startsWith("AI:")) {
            if (!hasStartedStreaming) {
              setGenerationState(GenerationState.STREAMING);
              hasStartedStreaming = true;
            }
            setGeneratedReadme((prev) => (prev ?? "") + chunk.slice(3));
          } else if (chunk.startsWith("RATE_LIMIT:")) {
            const limitInfo = JSON.parse(
              chunk.replace("RATE_LIMIT:", ""),
            ) as RateLimitInfo;
            setRateLimitInfo(limitInfo);
          }
        }

        const endTime = performance.now();
        const timeTaken = endTime - startTime;

        // Track successful generation
        trackReadmeGeneration({
          repo_path: new URL(form.getValues().repoUrl).pathname.replace(/^\//, ""),
          template_id: selectedTemplate,
          has_additional_context: additionalContext.length > 0,
          has_uploaded_files: uploadedFiles !== null,
          exclude_patterns: form.getValues().excludePatterns,
          generation_state: GenerationState.IDLE,
          version: nextVersion,
          time_taken: timeTaken,
        });

        setGenerationState(GenerationState.IDLE);
        toast({
          description: "README generated successfully!",
        });
      } catch (error) {
        console.error("Error in streaming:", error);
        setGenerationState(GenerationState.IDLE);
        setGeneratedReadme(null);

        trackGenerationError({
          type: "server_error",
          message: error instanceof Error ? error.message : "Failed to stream README content",
          repo_path: new URL(form.getValues().repoUrl).pathname.replace(/^\//, ""),
        });

        toast({
          variant: "destructive",
          title: "Error",
          description:
            error instanceof Error
              ? error.message
              : "Failed to stream README content",
        });
        if (setActiveTab) {
          setActiveTab("settings");
        }
      }
    },
  });

  const handleSubmit = async () => {
    const values = form.getValues();

    const mutationInput = {
      ...values,
      templateContent,
      additionalContext,
      files: uploadedFiles
        ? Array.from(uploadedFiles).map((file) => ({
            name: file.name,
            type: file.type,
            content: "",
          }))
        : undefined,
    };

    if (onTokenLimitExceeded) {
      onTokenLimitExceeded(null);
    }
    await generateReadmeStream.mutateAsync(mutationInput);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const validFiles: File[] = [];
      const skippedFiles: string[] = [];

      Array.from(e.target.files).forEach((file) => {
        if (
          file.type === "application/pdf" ||
          file.type.startsWith("text/") ||
          file.type.includes("javascript") ||
          file.type.includes("json") ||
          /\.(txt|md|js|jsx|ts|tsx|json|yaml|yml|xml|csv|html|css|scss|less|pdf)$/i.test(
            file.name,
          )
        ) {
          validFiles.push(file);
        } else {
          skippedFiles.push(file.name);
        }
      });

      if (skippedFiles.length > 0) {
        toast({
          title: "Unsupported files skipped",
          description: `Only text files and PDFs are supported. Skipped: ${skippedFiles.join(
            ", ",
          )}`,
          variant: "default",
        });
      }

      const dt = new DataTransfer();
      validFiles.forEach((file) => dt.items.add(file));
      setUploadedFiles(dt.files);
    }
  };

  const handleFileDelete = (indexToDelete: number) => {
    if (!uploadedFiles) return;
    const dt = new DataTransfer();
    Array.from(uploadedFiles).forEach((file, index) => {
      if (index !== indexToDelete) {
        dt.items.add(file);
      }
    });
    setUploadedFiles(dt.files);
  };

  return {
    form,
    generatedReadme,
    generationState,
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
    rateLimitInfo,
  };
};
