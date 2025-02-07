"use client";

import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import { Alert, AlertDescription } from "./ui/alert";
import { useTheme } from "next-themes";
import { type ViewMode } from "./view-mode-toggle";

interface MermaidProps {
  chart: string;
  viewMode: ViewMode;
}

interface MermaidRenderResult {
  svg: string;
}

interface MermaidAPI {
  initialize: (config: unknown) => void;
  render: (id: string, text: string) => Promise<MermaidRenderResult>;
  parse: (text: string) => void;
}

const mermaidAPI = mermaid as unknown as MermaidAPI;

// Convert HSL to Hex
const hslToHex = (h: number, s: number, l: number): string => {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};

// Get CSS variable value and convert from HSL to hex if needed
const getCssVar = (variable: string): string => {
  if (typeof window === "undefined") return "#000000";

  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(variable)
    .trim();

  // Check if it's an HSL value
  const hslRegex = /^(\d+)\s+(\d+\.?\d*)%\s+(\d+\.?\d*)%$/;
  const hslMatch = hslRegex.exec(value);
  if (hslMatch) {
    const [, h, s, l] = hslMatch;
    return hslToHex(Number(h), Number(s), Number(l));
  }

  return value;
};

const getMermaidConfig = (theme: string | undefined) => ({
  startOnLoad: false,
  theme: "base",
  themeVariables: {
    primaryColor: "#7c3aed", // violet-600
    primaryBorderColor: "#9333ea", // violet-700
    primaryTextColor: theme === "dark" ? "#ffffff" : "#000000",
    secondaryColor: theme === "dark" ? "#1e293b" : "#f3f4f6", // slate-800 : gray-100
    secondaryTextColor: theme === "dark" ? "#ffffff" : "#000000",
    tertiaryColor: theme === "dark" ? "#334155" : "#e5e7eb", // slate-700 : gray-200
    tertiaryTextColor: theme === "dark" ? "#ffffff" : "#000000",
    lineColor: theme === "dark" ? "#94a3b8" : "#6b7280", // slate-400 : gray-500
    textColor: theme === "dark" ? "#ffffff" : "#000000",
    mainBkg: theme === "dark" ? "#1e293b" : "#ffffff", // slate-800 : white
    nodeBorder: theme === "dark" ? "#475569" : "#d1d5db", // slate-600 : gray-300
    clusterBkg: theme === "dark" ? "#1e293b" : "#ffffff", // slate-800 : white
    clusterBorder: theme === "dark" ? "#475569" : "#d1d5db", // slate-600 : gray-300
    labelTextColor: theme === "dark" ? "#ffffff" : "#000000",
    edgeLabelBackground: theme === "dark" ? "#1e293b" : "#ffffff", // slate-800 : white
    nodeTextColor: theme === "dark" ? "#ffffff" : "#000000",
  },
  flowchart: {
    htmlLabels: true,
    curve: "basis",
    padding: 16,
    nodeSpacing: 50,
    rankSpacing: 50,
    nodeBorderRadius: "8px",
    clusterBorderRadius: "8px",
    securityLevel: "loose",
  },
});

const renderMermaidDiagram = async (
  container: HTMLDivElement,
  chart: string,
  setError: (error: string | null) => void,
) => {
  // Clear previous diagram and error
  container.innerHTML = "";
  setError(null);

  try {
    // Validate diagram syntax first
    mermaidAPI.parse(chart);

    // Generate unique ID for the diagram
    const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;

    // Create and render the diagram
    const { svg } = await mermaidAPI.render(id, chart);
    container.innerHTML = svg;

    // Add some CSS to the SVG for better styling
    const svgElement = container.querySelector("svg");
    if (svgElement) {
      svgElement.style.borderRadius = getCssVar("--radius");
      svgElement.style.maxWidth = "100%";
      svgElement.style.height = "auto";
    }
  } catch (error) {
    console.error("Failed to render mermaid diagram:", error);
    setError(
      error instanceof Error ? error.message : "Failed to render diagram",
    );
  }
};

export default function Mermaid({ chart, viewMode }: MermaidProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    // Initialize mermaid with custom theme
    mermaidAPI.initialize(getMermaidConfig(theme));

    if (viewMode === "preview" && containerRef.current) {
      void renderMermaidDiagram(containerRef.current, chart, setError);
    }
  }, [chart, theme, viewMode]);

  if (viewMode === "edit") {
    return (
      <pre className="rounded-lg bg-muted p-4 text-sm">
        <code>{chart}</code>
      </pre>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription className="whitespace-pre-wrap font-mono text-sm">
          {error}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div
      ref={containerRef}
      className="mermaid overflow-x-auto rounded-lg bg-muted p-4"
    >
      {/* Diagram will be rendered here */}
    </div>
  );
}
