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
    id: "minimal",
    name: "Minimal",
    description: "A concise template focusing on essential information",
    content: minimal,
  },
  {
    id: "othneildrew",
    name: "Othneil Drew's Best README Template",
    description: "An awesome README template to jumpstart your projects!",
    content: othneildrew,
  },
  {
    id: "louis3797",
    name: "Louis3797's Awesome README Template",
    description: "An awesome README template for your projects!",
    content: louis3797,
  },
  {
    id: "owen",
    name: "Owen's README Template",
    description: "A comprehensive template with a hero section",
    content: owen,
  },
];
