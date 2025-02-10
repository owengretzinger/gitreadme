import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { api } from "~/trpc/react";
import { useToast } from "./use-toast";
import { templates } from "~/components/readme-templates/readme-templates";

export interface RateLimitInfo {
  remaining: number;
  total: number;
  used: number;
}

export enum GenerationState {
  IDLE = "IDLE",
  CONTACTING_SERVER = "CONTACTING_SERVER",
  PACKING_REPOSITORY = "PACKING_REPOSITORY",
  WAITING_FOR_AI = "WAITING_FOR_AI",
  STREAMING = "STREAMING",
}

interface TokenLimitError {
  error: string;
  largest_files: Array<{ path: string; size_kb: number }>;
  estimated_tokens: number;
  files_analyzed: number;
}

interface RateLimitErrorResponse {
  message: string;
  info: RateLimitInfo;
}

const formSchema = z.object({
  repoUrl: z.string().url("Please enter a valid URL"),
  templateContent: z.string(),
  additionalContext: z.string(),
  excludePatterns: z.array(z.string()),
});

export type ReadmeFormData = z.infer<typeof formSchema>;

export const useReadmeForm = (
  onSuccess?: (repoPath: string) => void,
  onTokenLimitExceeded?: (
    files: Array<{ path: string; size_kb: number }> | null,
    shouldExpandDropdown?: boolean,
  ) => void,
) => {
  const [generatedReadme, setGeneratedReadme] = useState<string | null>(null);
  const [generationState, setGenerationState] = useState<GenerationState>(
    GenerationState.IDLE,
  );
  const [selectedTemplate, setSelectedTemplate] = useState("owen");
  const [additionalContext, setAdditionalContext] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<FileList | null>(null);
  const [templateContent, setTemplateContent] = useState(templates[0].content);
  const [rateLimitInfo, setRateLimitInfo] = useState<RateLimitInfo | null>(
    null,
  );
  const { toast } = useToast();

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

  const generateReadmeStream = api.readme.generateReadmeStream.useMutation({
    onMutate: () => {
      setGenerationState(GenerationState.CONTACTING_SERVER);
      setGeneratedReadme("");
      const repoPath = new URL(form.getValues().repoUrl).pathname.replace(
        /^\//,
        "",
      );
      if (onSuccess) onSuccess(repoPath);
    },
    onSuccess: async (stream) => {
      try {
        setGenerationState(GenerationState.PACKING_REPOSITORY);
        let hasStartedStreaming = false;

        for await (const chunk of stream) {
          if (chunk === "DONE_PACKING") {
            setGenerationState(GenerationState.WAITING_FOR_AI);
          } else if (chunk.startsWith("ERROR:TOKEN_LIMIT_EXCEEDED:")) {
            const errorData = JSON.parse(
              chunk.replace("ERROR:TOKEN_LIMIT_EXCEEDED:", ""),
            ) as TokenLimitError;
            if (onTokenLimitExceeded) {
              onTokenLimitExceeded(errorData.largest_files, true);
            }
            setGenerationState(GenerationState.IDLE);
            toast({
              variant: "destructive",
              title: "Repository Too Large",
              description:
                "The repository content exceeds the token limit. Please exclude some files and try again.",
            });
            return;
          } else if (chunk.startsWith("ERROR:RATE_LIMIT:")) {
            const errorData = JSON.parse(
              chunk.replace("ERROR:RATE_LIMIT:", ""),
            ) as RateLimitErrorResponse;
            setRateLimitInfo(errorData.info);
            setGenerationState(GenerationState.IDLE);

            toast({
              variant: "destructive",
              title: "Rate limit exceeded",
              description: errorData.message,
            });

            // Redirect to sign in after a very short delay to ensure toast is shown
            setTimeout(() => {
              const encodedMessage = encodeURIComponent(errorData.message);
              window.location.href = `/signin?error=rate_limit&message=${encodedMessage}`;
            }, 100);
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

        setGenerationState(GenerationState.IDLE);
        toast({
          description: "README generated successfully!",
        });
      } catch (error) {
        console.error("Error in streaming:", error);
        setGenerationState(GenerationState.IDLE);
        setGeneratedReadme(null);

        toast({
          variant: "destructive",
          title: "Error",
          description:
            error instanceof Error
              ? error.message
              : "Failed to stream README content",
        });
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
