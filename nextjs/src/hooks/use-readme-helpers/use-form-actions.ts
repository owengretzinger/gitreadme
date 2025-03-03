import { templates } from "~/components/readme-templates/readme-templates";
import { type UseFormReturn } from "react-hook-form";
import { type ReadmeFormData } from "./types";

export const useFormActions = (form: UseFormReturn<ReadmeFormData>) => {
  const getRepoPath = () => {
    const input = form.watch("repoUrl");
    if (!input) return undefined;

    // Check if input is already in the format "owner/repo"
    if (/^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/.test(input)) {
      return input.toLowerCase();
    }

    // Otherwise, try to parse as a URL
    try {
      const urlObj = new URL(input);
      if (
        urlObj.hostname === "github.com" &&
        urlObj.pathname.split("/").length >= 3
      ) {
        return urlObj.pathname.slice(1).toLowerCase();
      }
    } catch {
      // Return undefined if URL is invalid and doesn't match owner/repo format
      return undefined;
    }
    return undefined;
  };

  return {
    repoUrl: form.watch("repoUrl"),
    setRepoUrl: (url: string) => {
      // If the input is in the format "owner/repo", keep it as is
      // Otherwise, set it as provided
      form.setValue("repoUrl", url);
    },
    getRepoPath,
    setRepoUrlFromPath: (path: string) => {
      // Keep the original format if it was just "owner/repo"
      const currentUrl = form.watch("repoUrl");
      if (currentUrl && !currentUrl.includes("github.com") && 
          /^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/.test(currentUrl)) {
        form.setValue("repoUrl", path.toLowerCase());
      } else {
        form.setValue("repoUrl", `https://github.com/${path.toLowerCase()}`);
      }
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