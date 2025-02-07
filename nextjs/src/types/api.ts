export type PackRepositoryResponse = {
  success: true;
  files_analyzed: number;
  estimated_tokens: number;
  content: string;
} | {
  success: false;
  error: string;
  files_analyzed?: number;
  estimated_tokens?: number;
  largest_files?: Array<{
    path: string;
    size_kb: number;
  }>;
};

export type GenerateReadmeResponse = {
  success: true;
  readme: string;
  repomixOutput?: string;
  error?: never;
} | {
  success: false;
  error: string;
  repomixOutput?: string;
  readme?: never;
  largestFiles?: Array<{
    path: string;
    size_kb: number;
  }>;
};

export type GenerateArchitectureResponse = {
  success: true;
  diagram: string;
  repomixOutput?: string;
  error?: never;
} | {
  success: false;
  error: string;
  repomixOutput?: string;
  diagram?: never;
  largestFiles?: Array<{
    path: string;
    size_kb: number;
  }>;
}; 