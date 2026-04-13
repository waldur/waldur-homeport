/**
 * Raw JSON types that mirror the Rust structs in templemeads/src/.
 *
 * Serde rules (no serde(rename_all) anywhere in the codebase):
 *   - All field names are the exact snake_case names from Rust.
 *   - #[serde(default)] fields may be absent in JSON (older cached data).
 *   - #[serde(skip_serializing_if = "...")] fields are absent when empty/None.
 *   - Identifier types (ProjectIdentifier, UserIdentifier, Volume, etc.)
 *     serialise as plain strings via custom Serialize impls.
 *   - Usage serialises as { seconds: number }.
 *   - StorageSize / QuotaLimit serialise as human-readable strings e.g. "1.00 GB".
 */

// ─── Usage Report Types ───────────────────────────────────────────────────────

/**
 * mirrors templemeads::usagereport::Usage
 */
export interface Usage {
  seconds: number;
}

/**
 * mirrors templemeads::usagereport::DailyProjectUsageReport
 *
 * Fields with #[serde(default)] are optional — they will be absent in JSON
 * produced before those fields were added to the Rust struct.
 */
export interface DailyProjectUsageReportJson {
  /** local_username → Usage */
  reports: Record<string, Usage>;
  /**
   * component_name → local_username → Usage
   * e.g. { "cpu": { "chris.aiproject": { "seconds": 41055 } } }
   * #[serde(default)]
   */
  components?: Record<string, Record<string, Usage>>;
  /** local_username → job count. #[serde(default)] */
  user_job_counts?: Record<string, number>;
  /** local_username → wait seconds. #[serde(default)] */
  user_wait_seconds?: Record<string, number>;
  /** #[serde(default)] */
  num_jobs?: number;
  /** #[serde(default)] */
  total_wait_seconds?: number;
  is_complete: boolean;
}

/**
 * mirrors templemeads::usagereport::ProjectUsageReport
 * This is the `report` field of UsageReportApiItem.
 */
export interface ProjectUsageReportJson {
  /** ProjectIdentifier string e.g. "aiproject.brics" */
  project: string;
  /** "YYYY-MM-DD" → DailyProjectUsageReportJson */
  reports: Record<string, DailyProjectUsageReportJson>;
  /**
   * UserIdentifier → local_username
   * e.g. { "chris.aiproject.brics": "chris.aiproject" }
   */
  users: Record<string, string>;
}

/** Envelope item returned by GET /api/openportal-project-usage-reports/ */
export interface UsageReportApiItem {
  id: number;
  year: number;
  month: number;
  project_identifier: string;
  resource: string;
  is_complete: boolean;
  report: ProjectUsageReportJson;
}

// ─── Storage Report Types ─────────────────────────────────────────────────────

/**
 * mirrors templemeads::storage::Quota
 *
 * limit: QuotaLimit — "unlimited" or a human-readable size e.g. "1024.00 GB"
 * usage: Option<StorageUsage> — absent from JSON when None
 *        (#[serde(skip_serializing_if = "Option::is_none")])
 */
export interface QuotaJson {
  /** "unlimited" or a size string e.g. "1024.00 GB" */
  limit: string;
  /** Size string e.g. "24.00 KB". Absent when the server has no usage data. */
  usage?: string;
}

/**
 * mirrors templemeads::storagereport::DailyStorageReport (pub(crate))
 * Appears as values in ProjectStorageReportJson.daily_reports.
 * Same shape as ProjectStorageReport but without the `users` field.
 */
export interface DailyStorageReportJson {
  project: string;
  /** RFC3339 timestamp */
  generated_at: string;
  /** Volume → Quota */
  project_quotas: Record<string, QuotaJson>;
  /** UserIdentifier → (Volume → Quota) */
  user_quotas: Record<string, Record<string, QuotaJson>>;
}

/**
 * mirrors templemeads::storagereport::ProjectStorageReport
 * This is the `report` field of StorageReportApiItem.
 */
export interface ProjectStorageReportJson {
  project: string;
  /** RFC3339 timestamp */
  generated_at: string;
  /** Volume → Quota */
  project_quotas: Record<string, QuotaJson>;
  /** UserIdentifier → (Volume → Quota) */
  user_quotas: Record<string, Record<string, QuotaJson>>;
  /** UserIdentifier → local_username */
  users: Record<string, string>;
  /**
   * "YYYY-MM-DD" → DailyStorageReportJson
   * #[serde(default, skip_serializing_if = "HashMap::is_empty")]
   * Absent from JSON when there are no daily snapshots.
   */
  daily_reports?: Record<string, DailyStorageReportJson>;
}

/** Envelope item returned by GET /api/openportal-project-storage-reports/ */
export interface StorageReportApiItem {
  id: number;
  year: number;
  month: number;
  project_identifier: string;
  resource: string;
  report: ProjectStorageReportJson;
}

// ─── Accounting Summary Types (stubs — replace after mastermind MR1 + SDK regen) ──

/** Stub for ProjectAccountingSummary — will be replaced by SDK-generated type */
export interface ProjectAccountingSummary {
  project_uuid: string;
  project_name: string;
  start_date: string | null;
  end_date: string | null;
  total_credits: string;
  total_spend: string;
  current_month_spend: string;
  is_expired?: boolean;
  is_in_grace_period?: boolean;
}

/** Extends the SDK Project type with OpenPortal-specific optional fields */
export interface OpenPortalProject {
  uuid?: string;
  name?: string;
  start_date?: string | null;
  end_date?: string | null;
  is_expired?: boolean;
  is_in_grace_period?: boolean;
  [key: string]: unknown;
}

// ─── API Filter Types ─────────────────────────────────────────────────────────

export interface UsageReportFilters {
  year?: number;
  month?: number;
  project_uuid?: string;
  project_identifier?: string;
  resource?: string;
  is_complete?: boolean;
}

export interface StorageReportFilters {
  year?: number;
  month?: number;
  project_uuid?: string;
  project_identifier?: string;
  resource?: string;
}
