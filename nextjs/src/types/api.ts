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
  repoPackerOutput?: string;
  error?: never;
} | {
  success: false;
  error: string;
  repoPackerOutput?: string;
  readme?: never;
  largestFiles?: Array<{
    path: string;
    size_kb: number;
  }>;
};

export type GenerateArchitectureResponse = {
  success: true;
  diagram: string;
  repoPackerOutput?: string;
  error?: never;
} | {
  success: false;
  error: string;
  repoPackerOutput?: string;
  diagram?: never;
  largestFiles?: Array<{
    path: string;
    size_kb: number;
  }>;
}; 