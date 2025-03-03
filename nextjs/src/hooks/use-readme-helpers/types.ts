import { z } from "zod";
import { templates } from "~/components/readme-templates/readme-templates";

export const formSchema = z.object({
  repoUrl: z.string().refine(
    (value) => {
      // Check if it's in the format "owner/repo"
      if (/^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/.test(value)) {
        return true;
      }
      
      // Check if it's a valid GitHub URL
      try {
        const url = new URL(value);
        return (
          url.hostname === "github.com" && 
          url.pathname.split("/").length >= 3
        );
      } catch {
        return false;
      }
    },
    {
      message: "Please enter a valid GitHub URL or repository path (owner/repo)",
    }
  ),
  templateId: z.string(),
  templateContent: z.string(),
  additionalContext: z.string(),
  excludePatterns: z.array(z.string()),
});

export type ReadmeFormData = z.infer<typeof formSchema>;

export const defaultFormValues: ReadmeFormData = {
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