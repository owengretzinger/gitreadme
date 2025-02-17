import { z } from "zod";
import { templates } from "~/components/readme-templates/readme-templates";

export const formSchema = z.object({
  repoUrl: z.string(),
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