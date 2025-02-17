import posthog from "posthog-js";
import type { GenerationState } from "~/hooks/use-readme-helpers/use-readme-stream";

export type ReadmeGenerationEvent = {
  repo_path: string;
  template_id: string;
  has_additional_context: boolean;
  has_uploaded_files: boolean;
  exclude_patterns: string[];
  generation_state: GenerationState;
  time_taken?: number;
};

export type ReadmeViewEvent = {
  repo_path: string;
  source: "dashboard" | "direct" | "shared";
  time_since_generation?: string;
};

export type TemplateSelectEvent = {
  template_id: string;
  previous_template_id?: string;
};

export type RateLimitEvent = {
  user_id?: string;
  ip_address?: string;
  limit_type: "authenticated" | "unauthenticated";
  current_count: number;
  limit: number;
};

export const trackReadmeGeneration = (event: ReadmeGenerationEvent) => {
  const currentTotal =
    Number(posthog.get_property("total_readmes_generated")) || 0;
  posthog.capture("readme_generation", {
    ...event,
    $set: {
      last_generation_date: new Date().toISOString(),
      total_readmes_generated: currentTotal + 1,
    },
  });
};

export const trackReadmeView = (event: ReadmeViewEvent) => {
  posthog.capture("readme_view", event);
};

export const trackTemplateSelect = (event: TemplateSelectEvent) => {
  posthog.capture("template_select", event);
};

export const trackRateLimit = (event: RateLimitEvent) => {
  posthog.capture("rate_limit_reached", event);
};

export const trackDashboardView = (data: {
  total_readmes: number;
  generations_today: number;
}) => {
  posthog.capture("dashboard_view", data);
};

export const trackGenerationError = (error: {
  type: "token_limit" | "rate_limit" | "server_error";
  message: string;
  repo_path: string;
  details?: Record<string, unknown>;
}) => {
  posthog.capture("generation_error", error);
};
