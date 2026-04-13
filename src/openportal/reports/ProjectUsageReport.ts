/**
 * TypeScript wrapper mirroring the Rust structs in
 * templemeads/src/usagereport.rs (ProjectUsageReport, DailyProjectUsageReport).
 *
 * Design intent: fetch once via the API, then use these classes to slice,
 * filter and aggregate the data client-side without re-fetching.
 */

import { secondsToHours } from './storage';
import {
  DailyProjectUsageReportJson,
  ProjectUsageReportJson,
  Usage,
  UsageReportApiItem,
} from './types';

// ─── DailyProjectUsageReport ─────────────────────────────────────────────────

/**
 * Wraps DailyProjectUsageReport from templemeads/src/usagereport.rs.
 *
 * Note on key types:
 *   reports        — local_username (not UserIdentifier) → Usage
 *   components     — component_name → local_username → Usage
 *   user_job_counts — local_username → count
 *   user_wait_seconds — local_username → seconds
 */
export class DailyProjectUsageReport {
  constructor(
    readonly date: string,
    private readonly json: DailyProjectUsageReportJson,
  ) {}

  get isComplete(): boolean {
    return this.json.is_complete;
  }

  /** Total job count for the day across all users. #[serde(default)] field. */
  get numJobs(): number {
    return this.json.num_jobs ?? 0;
  }

  /** Total scheduler wait seconds across all users. #[serde(default)] field. */
  get totalWaitSeconds(): number {
    return this.json.total_wait_seconds ?? 0;
  }

  /** local_username → Usage (wall-clock seconds). */
  get reports(): Readonly<Record<string, Usage>> {
    return this.json.reports;
  }

  /**
   * component_name → local_username → Usage.
   * e.g. { cpu: { "chris.aiproject": { seconds: 41055 } } }
   * #[serde(default)] — empty object when absent.
   */
  get components(): Readonly<Record<string, Record<string, Usage>>> {
    return this.json.components ?? {};
  }

  /** local_username → job count. #[serde(default)] */
  get userJobCounts(): Readonly<Record<string, number>> {
    return this.json.user_job_counts ?? {};
  }

  /** local_username → scheduler wait seconds. #[serde(default)] */
  get userWaitSeconds(): Readonly<Record<string, number>> {
    return this.json.user_wait_seconds ?? {};
  }

  /** Total usage summed across all users for this day. */
  totalUsage(): Usage {
    const seconds = Object.values(this.json.reports).reduce(
      (sum, u) => sum + u.seconds,
      0,
    );
    return { seconds };
  }

  totalUsageHours(): number {
    return secondsToHours(this.totalUsage().seconds);
  }

  /** Usage for a specific local_username on this day. Returns zero if absent. */
  usageForUser(localUser: string): Usage {
    return this.json.reports[localUser] ?? { seconds: 0 };
  }

  /**
   * Usage for a specific component and local_username on this day.
   * e.g. componentUsageForUser("cpu", "chris.aiproject")
   */
  componentUsageForUser(component: string, localUser: string): Usage {
    return this.json.components?.[component]?.[localUser] ?? { seconds: 0 };
  }

  /** All local_usernames that ran jobs on this day. */
  localUsers(): string[] {
    return Object.keys(this.json.reports);
  }
}

// ─── ProjectUsageReport ───────────────────────────────────────────────────────

/**
 * Wraps ProjectUsageReport from templemeads/src/usagereport.rs.
 *
 * This is the primary object to work with after fetching from the API.
 * All filtering and aggregation operates on already-loaded data — no
 * additional API calls are made by any method on this class.
 */
export class ProjectUsageReport {
  constructor(
    private readonly json: ProjectUsageReportJson,
    readonly apiItem: UsageReportApiItem,
  ) {}

  // ─── Identity ───────────────────────────────────────────────────────────────

  /** ProjectIdentifier string e.g. "aiproject.brics" */
  get project(): string {
    return this.json.project;
  }

  get year(): number {
    return this.apiItem.year;
  }

  get month(): number {
    return this.apiItem.month;
  }

  /** Resource string e.g. "brics.aip1.clusters.shared" */
  get resource(): string {
    return this.apiItem.resource;
  }

  get isComplete(): boolean {
    return this.apiItem.is_complete;
  }

  // ─── User identity maps ──────────────────────────────────────────────────────

  /**
   * UserIdentifier → local_username as stored in the report.
   * e.g. { "chris.aiproject.brics": "chris.aiproject" }
   */
  get users(): Readonly<Record<string, string>> {
    return this.json.users;
  }

  /**
   * Derived reverse map: local_username → UserIdentifier.
   * e.g. { "chris.aiproject": "chris.aiproject.brics" }
   */
  get localToIdentifier(): Readonly<Record<string, string>> {
    return Object.fromEntries(
      Object.entries(this.json.users).map(([uid, local]) => [local, uid]),
    );
  }

  // ─── Dates ──────────────────────────────────────────────────────────────────

  /** All date strings present in this report, sorted ascending. */
  get dates(): string[] {
    return Object.keys(this.json.reports).sort();
  }

  // ─── Daily reports ──────────────────────────────────────────────────────────

  /** All daily reports sorted by date ascending. */
  dailyReports(): DailyProjectUsageReport[] {
    return this.dates.map(
      (date) => new DailyProjectUsageReport(date, this.json.reports[date]),
    );
  }

  /** Daily report for a specific date string "YYYY-MM-DD". Returns undefined if not present. */
  getReport(date: string): DailyProjectUsageReport | undefined {
    const r = this.json.reports[date];
    return r ? new DailyProjectUsageReport(date, r) : undefined;
  }

  // ─── Local users ────────────────────────────────────────────────────────────

  /**
   * All local_usernames that appear in any daily report, sorted.
   * Uses the daily reports (not the users map) so it reflects actual activity.
   */
  localUsers(): string[] {
    const users = new Set<string>();
    for (const daily of Object.values(this.json.reports)) {
      for (const user of Object.keys(daily.reports)) users.add(user);
    }
    return [...users].sort();
  }

  // ─── Components ─────────────────────────────────────────────────────────────

  /** All component names present across all daily reports (cpu, memory, billing, …). */
  componentNames(): string[] {
    const components = new Set<string>();
    for (const daily of Object.values(this.json.reports)) {
      for (const c of Object.keys(daily.components ?? {})) components.add(c);
    }
    return [...components].sort();
  }

  // ─── Aggregated usage ───────────────────────────────────────────────────────

  /** Total usage (wall-clock seconds) summed across all days and all users. */
  totalUsage(): Usage {
    let seconds = 0;
    for (const daily of Object.values(this.json.reports)) {
      for (const u of Object.values(daily.reports)) seconds += u.seconds;
    }
    return { seconds };
  }

  totalUsageHours(): number {
    return secondsToHours(this.totalUsage().seconds);
  }

  /** Total usage for a specific local_username summed across all days. */
  usageForUser(localUser: string): Usage {
    let seconds = 0;
    for (const daily of Object.values(this.json.reports)) {
      seconds += daily.reports[localUser]?.seconds ?? 0;
    }
    return { seconds };
  }

  /** Total component usage for a specific component and local_username across all days. */
  componentUsageForUser(component: string, localUser: string): Usage {
    let seconds = 0;
    for (const daily of Object.values(this.json.reports)) {
      seconds += daily.components?.[component]?.[localUser]?.seconds ?? 0;
    }
    return { seconds };
  }

  /**
   * Usage per local_username, sorted by descending usage.
   * Useful for building pie charts.
   */
  usageByUser(): Array<{ user: string; usage: Usage }> {
    return this.localUsers()
      .map((user) => ({ user, usage: this.usageForUser(user) }))
      .sort((a, b) => b.usage.seconds - a.usage.seconds);
  }

  /**
   * Component usage per local_username for a given component, sorted descending.
   */
  componentUsageByUser(
    component: string,
  ): Array<{ user: string; usage: Usage }> {
    return this.localUsers()
      .map((user) => ({
        user,
        usage: this.componentUsageForUser(component, user),
      }))
      .sort((a, b) => b.usage.seconds - a.usage.seconds);
  }

  // ─── Filtering (no API calls — operates on already-loaded data) ──────────────

  /**
   * Return a new ProjectUsageReport containing only dates in [startDate, endDate]
   * (both inclusive, "YYYY-MM-DD" string comparison).
   * No API call is made.
   */
  filterByDateRange(startDate: string, endDate: string): ProjectUsageReport {
    const filtered: Record<string, DailyProjectUsageReportJson> = {};
    for (const [date, daily] of Object.entries(this.json.reports)) {
      if (date >= startDate && date <= endDate) filtered[date] = daily;
    }
    return new ProjectUsageReport(
      { ...this.json, reports: filtered },
      this.apiItem,
    );
  }

  // ─── Static constructors ────────────────────────────────────────────────────

  /**
   * Combine multiple ProjectUsageReport instances by summing all usage values.
   * Useful for merging reports across different resources or consecutive months.
   *
   * - Users maps are merged (union).
   * - Daily reports for the same date are merged by summing seconds.
   * - Daily reports for different dates are preserved as-is.
   */
  static combine(reports: ProjectUsageReport[]): ProjectUsageReport {
    if (reports.length === 0) throw new Error('Cannot combine empty array');
    if (reports.length === 1) return reports[0];

    const users: Record<string, string> = {};
    for (const r of reports) Object.assign(users, r.json.users);

    const mergedDays: Record<string, DailyProjectUsageReportJson> = {};
    for (const r of reports) {
      for (const [date, daily] of Object.entries(r.json.reports)) {
        if (!mergedDays[date]) {
          mergedDays[date] = {
            reports: {},
            components: {},
            user_job_counts: {},
            user_wait_seconds: {},
            num_jobs: 0,
            total_wait_seconds: 0,
            is_complete: daily.is_complete,
          };
        }
        const m = mergedDays[date];

        for (const [user, u] of Object.entries(daily.reports)) {
          m.reports[user] = {
            seconds: (m.reports[user]?.seconds ?? 0) + u.seconds,
          };
        }

        for (const [comp, byUser] of Object.entries(daily.components ?? {})) {
          m.components![comp] ??= {};
          for (const [user, u] of Object.entries(byUser)) {
            m.components![comp][user] = {
              seconds: (m.components![comp][user]?.seconds ?? 0) + u.seconds,
            };
          }
        }

        for (const [user, count] of Object.entries(
          daily.user_job_counts ?? {},
        )) {
          m.user_job_counts![user] = (m.user_job_counts![user] ?? 0) + count;
        }
        for (const [user, wait] of Object.entries(
          daily.user_wait_seconds ?? {},
        )) {
          m.user_wait_seconds![user] = (m.user_wait_seconds![user] ?? 0) + wait;
        }
        m.num_jobs = (m.num_jobs ?? 0) + (daily.num_jobs ?? 0);
        m.total_wait_seconds =
          (m.total_wait_seconds ?? 0) + (daily.total_wait_seconds ?? 0);
        m.is_complete = m.is_complete && daily.is_complete;
      }
    }

    const first = reports[0];
    return new ProjectUsageReport(
      { project: first.project, reports: mergedDays, users },
      {
        ...first.apiItem,
        resource: reports.map((r) => r.resource).join(', '),
      },
    );
  }

  static fromApiResponse(item: UsageReportApiItem): ProjectUsageReport {
    return new ProjectUsageReport(item.report, item);
  }
}
