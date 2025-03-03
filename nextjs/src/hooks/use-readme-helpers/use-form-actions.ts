import { templates } from "~/components/readme-templates/readme-templates";
import { type UseFormReturn } from "react-hook-form";
import { type ReadmeFormData } from "./types";

export const useFormActions = (form: UseFormReturn<ReadmeFormData>) => {
  const getRepoPath = () => {
    const url = form.watch("repoUrl");
    if (!url) return undefined;
    try {
      const urlObj = new URL(url);
      if (
        urlObj.hostname === "github.com" &&
        urlObj.pathname.split("/").length >= 3
      ) {
        return urlObj.pathname.slice(1).toLowerCase();
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
      form.setValue("repoUrl", `https://github.com/${path.toLowerCase()}`);
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