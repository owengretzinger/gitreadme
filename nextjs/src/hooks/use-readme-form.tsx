import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { api } from "~/trpc/react";
import { useToast } from "./use-toast";
import { templates } from "~/components/readme-templates/readme-templates";
import { Button } from "~/components/ui/button";
import posthog from "posthog-js";

interface LargeFile {
  path: string;
  size_kb: number;
}

interface RateLimitInfo {
  limit: string;
  reset?: string;
}

interface BaseError {
  success: false;
  error: string;
  repoPackerOutput?: string;
  readme?: undefined;
}

interface LargeRepoError extends BaseError {
  largestFiles: LargeFile[];
  rateLimitInfo?: undefined;
}

interface RateLimitError extends BaseError {
  rateLimitInfo: RateLimitInfo;
  largestFiles?: undefined;
}

interface GenericError extends BaseError {
  largestFiles?: LargeFile[];
  rateLimitInfo?: RateLimitInfo;
}

type GenerationError = LargeRepoError | RateLimitError | GenericError;

const formSchema = z.object({
  repoUrl: z.string().url("Please enter a valid URL"),
  templateContent: z.string(),
  additionalContext: z.string(),
  excludePatterns: z.array(z.string()).default([]),
});

export type ReadmeFormData = z.infer<typeof formSchema>;

export const useReadmeForm = (onSuccess?: () => void) => {
  const [generatedReadme, setGeneratedReadme] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("minimal");
  const [additionalContext, setAdditionalContext] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<FileList | null>(null);
  const [templateContent, setTemplateContent] = useState(templates[0].content);
  const { toast } = useToast();

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
      excludePatterns: [],
    },
  });

  const generateReadmeStream = api.readme.generateReadmeStream.useMutation({
    onMutate: () => {
      setIsStreaming(true);
      setGeneratedReadme("");
      onSuccess?.();
    },
    onSuccess: async (data) => {
      try {
        for await (const chunk of data) {
          setGeneratedReadme((prev) => (prev ?? "") + chunk);
        }
        toast({
          description: "README generated successfully!",
        });
      } catch (error) {
        console.error("Error in streaming:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to stream README content",
        });
      } finally {
        setIsStreaming(false);
      }
    },
    onError: (e) => {
      handleGenerationError({
        success: false,
        error: e.message,
      });
      setIsStreaming(false);
      setGeneratedReadme(null);
    },
  });

  const handleGenerationError = (error: GenerationError) => {
    if (
      "largestFiles" in error &&
      Array.isArray(error.largestFiles) &&
      error.largestFiles.length > 0
    ) {
      handleLargeRepoError(error as LargeRepoError);
    } else if ("rateLimitInfo" in error && error.rateLimitInfo) {
      handleRateLimitError(error as RateLimitError);
    } else {
      handleGenericError(error as GenericError);
    }
  };

  const handleLargeRepoError = (error: LargeRepoError) => {
    posthog.capture("readme_generation", {
      success: false,
      repo_url: form.getValues("repoUrl"),
      template: selectedTemplate,
      error: "Repository too large",
    });

    toast({
      variant: "destructive",
      title: "Repository too large",
      description: (
        <div className="mt-2 space-y-2">
          <p>{error.error}</p>
          <p className="font-semibold">Largest files:</p>
          <ul className="list-inside list-disc space-y-1">
            {error.largestFiles.map((file) => (
              <li key={file.path}>
                {file.path} ({file.size_kb.toFixed(1)} KB)
              </li>
            ))}
          </ul>
          <Button
            variant="outline"
            className="mt-2"
            onClick={() => {
              const patterns = error.largestFiles.map((f) => f.path);
              form.setValue("excludePatterns", patterns);
              void handleSubmit();
            }}
          >
            Retry excluding these files
          </Button>
        </div>
      ),
    });
  };

  const handleRateLimitError = (error: RateLimitError) => {
    posthog.capture("readme_generation", {
      success: false,
      repo_url: form.getValues("repoUrl"),
      template: selectedTemplate,
      error: "Rate limit exceeded",
    });

    toast({
      variant: "destructive",
      title: "Rate limit exceeded",
      description: (
        <div className="mt-2 space-y-2">
          <p>Too many requests. Please wait before trying again.</p>
          {error.rateLimitInfo.limit && (
            <p>Limit: {error.rateLimitInfo.limit}</p>
          )}
          {error.rateLimitInfo.reset && (
            <p>Try again in {error.rateLimitInfo.reset} seconds</p>
          )}
        </div>
      ),
    });
  };

  const handleGenericError = (error: GenericError) => {
    posthog.capture("readme_generation", {
      success: false,
      repo_url: form.getValues("repoUrl"),
      template: selectedTemplate,
      error: "Unknown error",
      error_message: error.error,
    });

    toast({
      variant: "destructive",
      title: "Error",
      description: error.error ?? "An unknown error occurred",
    });
  };

  const handleSubmit = async (useStreaming = true) => {
    const values = form.getValues();
    if (useStreaming) {
      setIsLoading(false);
    } else {
      setIsLoading(true);
      setGeneratedReadme(null);
    }

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
    isLoading: isLoading || isStreaming,
    isStreaming,
    generatedReadme,
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
  };
};
