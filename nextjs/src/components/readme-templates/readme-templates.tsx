import othneildrew from "./othneildrew.md";
import owen from "./owen.md";
import none from "./none.md";
import textOnly from "./text-only.md";

export type ReadmeTemplate = {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly content: string;
};

export const templates: readonly [ReadmeTemplate, ...ReadmeTemplate[]] = [
  {
    id: "owen",
    name: "Owen's README Template",
    description:
      "Hero section, table of contents, demo video, etc. (optimized for this tool)",
    content: owen,
  },
  {
    id: "text-only",
    name: "Text Only",
    description: "Like Owen's, but no visual elements, just text.",
    content: textOnly,
  },
  {
    id: "othneildrew",
    name: 'Othneil Drew\'s "Best README Template"',
    description:
      "Badges, hero section, table of contents, top contributors, etc.",
    content: othneildrew,
  },
  {
    id: "none",
    name: "No Template",
    description:
      "No template (let the AI decide the structure or paste in your own)",
    content: none,
  },
];
