export type PitchTemplate = {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly sections: string[];
};

export const pitchTemplates: readonly [PitchTemplate, ...PitchTemplate[]] = [
  {
    id: "problem-solution",
    name: "Problem-Solution",
    description:
      "Classic format focusing on the problem, solution, and market opportunity",
    sections: [
      "Problem Statement",
      "Solution Overview",
      "Market Opportunity",
      "Technical Implementation",
      "Business Model",
    ],
  },
  {
    id: "story-driven",
    name: "Story-Driven",
    description:
      "Narrative approach that tells a compelling story about your project",
    sections: [
      "Hook/Opening",
      "Personal Story",
      "Problem Revelation",
      "Solution Journey",
      "Impact & Vision",
    ],
  },
  {
    id: "demo-focused",
    name: "Demo-Focused",
    description: "Emphasizes live demonstration and technical achievements",
    sections: [
      "Quick Intro",
      "Technical Overview",
      "Live Demo Script",
      "Innovation Highlights",
      "Future Roadmap",
    ],
  },
];
