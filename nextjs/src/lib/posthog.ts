import posthog, {
  type CaptureOptions,
  type CaptureResult,
  type EventName,
  type Properties,
} from "posthog-js";
import type { ErrorType } from "~/types/errors";

// We'll store the current user ID here when identifyUser is called
let currentUserId: string | null = null;

export function identifyUser(
  userId: string,
  userProperties?: Record<string, string | number | boolean | null>,
) {
  if (userId) {
    currentUserId = userId;
    posthog.identify(userId, userProperties);
  }
}

export function resetUser() {
  currentUserId = null;
  posthog.reset();
}

export function phCapture(
  event_name: EventName,
  properties?: Properties | null,
  options?: CaptureOptions,
): CaptureResult | undefined {
  // Automatically include the user_id in all events if available
  return posthog.capture(
    event_name,
    {
      environment: process.env.NODE_ENV,
      user_id: currentUserId,
      ...properties,
    },
    options,
  );
}

export type ReadmeGenerationEvent = {
  repo_path: string;
  template_id: string;
  edited_template: boolean;
  added_additional_context: boolean;
};
export const trackReadmeGeneration = (event: ReadmeGenerationEvent) => {
  phCapture("readme_generation", event);
};

export type GenerationErrorEvent = {
  repo_path: string;
  error_type: ErrorType;
  message: string;
};
export const trackGenerationError = (error: GenerationErrorEvent) => {
  phCapture("generation_error", error);
};

export type ReadmeViewEvent = {
  repo_path: string;
  short_id: string;
};
export const trackReadmeView = (event: ReadmeViewEvent) => {
  phCapture("readme_view", event);
};

export type TemplateSelectEvent = {
  template_id: string;
};
export const trackTemplateSelect = (event: TemplateSelectEvent) => {
  phCapture("template_select", event);
};
