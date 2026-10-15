interface ReportSection {
  header: string;
  body: string;
}

export type Report = ReportSection[];

/**
 * Resource option values the API shows as the limits of usage-based
 * components; they are not stored in `limits`. Drop this once the SDK's
 * `Resource` carries the field.
 */
export interface ResourceDisplayLimits {
  display_limits?: Record<string, number>;
}
