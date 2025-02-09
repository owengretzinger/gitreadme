import minimal from "./minimal.md";
import othneildrew from "./othneildrew.md";
import louis3797 from "./louis3797.md";
import owen from "./owen.md";

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
    description: "Hero section, table of contents, demo video, etc. (optimized for this tool)",
    content: owen,
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Concise, focusing on essential information, no visual elements",
    content: minimal,
  },
  {
    id: "othneildrew",
    name: "Othneil Drew's Best README Template",
    description: "Badges, hero section, table of contents, top contributors, etc.",
    content: othneildrew,
  },
  {
    id: "louis3797",
    name: "Louis3797's Awesome README Template",
    description: "Badges, emojis",
    content: louis3797,
  },
  {
    id: "none",
    name: "No Template",
    description: "No template (let the AI decide the structure)",
    content:
      "(No template was selected. Please come up with a structure for the file based on the project contents.)",
  },
];
