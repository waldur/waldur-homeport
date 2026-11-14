/**
 * TypeScript wrapper mirroring the Rust structs in
 * templemeads/src/storagereport.rs (ProjectStorageReport, DailyStorageReport)
 * and templemeads/src/storage.rs (Quota).
 */

import {
  DailyStorageReport as DailyStorageReportJson,
  ProjectStorageReport as ProjectStorageReportJson,
  OpenPortalQuota as QuotaJson,
  CachedProjectStorageReport as StorageReportApiItem,
} from 'waldur-js-client';

import { translate } from '@/i18n';

import { formatStorageBytes, parseStorageBytes } from './storage';

// ─── Quota ────────────────────────────────────────────────────────────────────

/**
 * Wraps templemeads::storage::Quota.
 * Provides parsed byte values alongside the raw strings from JSON.
 */
export class Quota {
  constructor(private readonly json: QuotaJson) {}

  /** Raw limit string as serialised by Rust: "unlimited" or "1024.00 GB". */
  get limit(): string {
    return this.json.limit;
  }

  /** Raw usage string as serialised by Rust: "24.00 KB". Undefined if not reported. */
  get usage(): string | undefined {
    return this.json.usage;
  }

  /** Limit in bytes. Infinity when limit is "unlimited". */
  get limitBytes(): number {
    return parseStorageBytes(this.json.limit);
  }

  /** Usage in bytes. 0 when no usage data is present. */
  get usageBytes(): number {
    return this.json.usage ? parseStorageBytes(this.json.usage) : 0;
  }

  /** Available bytes remaining. Infinity when limit is unlimited. */
  get availableBytes(): number {
    return isFinite(this.limitBytes)
      ? Math.max(0, this.limitBytes - this.usageBytes)
      : Infinity;
  }

  /** Fraction used in [0, 1]. 0 when limit is unlimited or zero. */
  get usedFraction(): number {
    if (!isFinite(this.limitBytes) || this.limitBytes === 0) return 0;
    return Math.min(1, this.usageBytes / this.limitBytes);
  }

  /** Human-readable limit string e.g. "1.00 TB". "Unlimited" for unlimited. */
  get limitFormatted(): string {
    return isFinite(this.limitBytes)
      ? formatStorageBytes(this.limitBytes)
      : translate('Unlimited');
  }

  /** Human-readable usage string e.g. "24.00 KB". */
  get usageFormatted(): string {
    return formatStorageBytes(this.usageBytes);
  }
}

// ─── DailyStorageReport ───────────────────────────────────────────────────────

/**
 * Wraps DailyStorageReport (pub(crate)) from templemeads/src/storagereport.rs.
 * Appears as values of ProjectStorageReport.daily_reports.
 * Same shape as ProjectStorageReport but without the `users` identity map.
 */
class DailyStorageReport {
  constructor(
    readonly date: string,
    private readonly json: DailyStorageReportJson,
  ) {}

  get project(): string {
    return this.json.project;
  }

  get generatedAt(): Date {
    return new Date(this.json.generated_at);
  }

  /** Volume → Quota for the project on this day. */
  get projectQuotas(): Record<string, Quota> {
    return Object.fromEntries(
      Object.entries(this.json.project_quotas).map(([v, q]) => [
        v,
        new Quota(q),
      ]),
    );
  }

  /** UserIdentifier → (Volume → Quota) for this day. */
  get userQuotas(): Record<string, Record<string, Quota>> {
    return Object.fromEntries(
      Object.entries(this.json.user_quotas).map(([uid, vols]) => [
        uid,
        Object.fromEntries(
          Object.entries(vols).map(([v, q]) => [v, new Quota(q)]),
        ),
      ]),
    );
  }
}

// ─── ProjectStorageReport ─────────────────────────────────────────────────────

/**
 * Wraps ProjectStorageReport from templemeads/src/storagereport.rs.
 *
 * All filtering and aggregation operates on already-loaded data — no
 * additional API calls are made by any method on this class.
 */
export class ProjectStorageReport {
  private readonly json: ProjectStorageReportJson;

  constructor(
    json: ProjectStorageReportJson,
    readonly apiItem: StorageReportApiItem,
  ) {
    this.json = withLatestInSeries(json);
  }

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

  get resource(): string {
    return this.apiItem.resource;
  }

  get generatedAt(): Date {
    return new Date(this.json.generated_at);
  }

  /** True when both project_quotas and user_quotas are empty. */
  get isEmpty(): boolean {
    return (
      Object.keys(this.json.project_quotas).length === 0 &&
      Object.keys(this.json.user_quotas).length === 0
    );
  }

  // ─── User identity ──────────────────────────────────────────────────────────

  /**
   * UserIdentifier → local_username.
   * e.g. { "chris.aiproject.brics": "chris.aiproject" }
   */
  get users(): Readonly<Record<string, string>> {
    return this.json.users;
  }

  /** All UserIdentifiers that have quota entries, sorted. */
  userIdentifiers(): string[] {
    return Object.keys(this.json.user_quotas).sort();
  }

  // ─── Volumes ────────────────────────────────────────────────────────────────

  /** All volume names present in user or project quotas, sorted. */
  volumes(): string[] {
    const vols = new Set<string>(Object.keys(this.json.project_quotas));
    for (const v of Object.values(this.json.user_quotas)) {
      for (const vol of Object.keys(v)) vols.add(vol);
    }
    return [...vols].sort();
  }

  // ─── Project quotas ─────────────────────────────────────────────────────────

  /** Volume → Quota for the project as a whole. */
  get projectQuotas(): Record<string, Quota> {
    return Object.fromEntries(
      Object.entries(this.json.project_quotas).map(([v, q]) => [
        v,
        new Quota(q),
      ]),
    );
  }

  // ─── User quotas ────────────────────────────────────────────────────────────

  /** Volume → Quota for a specific UserIdentifier. Empty record if not found. */
  quotaForUser(userId: string): Record<string, Quota> {
    return Object.fromEntries(
      Object.entries(this.json.user_quotas[userId] ?? {}).map(([v, q]) => [
        v,
        new Quota(q),
      ]),
    );
  }

  /** All user quotas: UserIdentifier → (Volume → Quota). */
  get userQuotas(): Record<string, Record<string, Quota>> {
    return Object.fromEntries(
      this.userIdentifiers().map((uid) => [uid, this.quotaForUser(uid)]),
    );
  }

  // ─── Daily snapshots ────────────────────────────────────────────────────────

  /** @internal The report's JSON, for combining. */
  rawJson(): ProjectStorageReportJson {
    return this.json;
  }

  /** @internal The series as JSON, for combining. */
  dailyJson(): Record<string, DailyStorageReportJson> {
    return this.json.daily_reports ?? {};
  }

  /** All dates with daily snapshots, sorted ascending. */
  get dates(): string[] {
    return Object.keys(this.json.daily_reports ?? {}).sort();
  }

  /** Daily storage snapshots sorted by date ascending. Empty array if none present. */
  dailyReports(): DailyStorageReport[] {
    if (!this.json.daily_reports) return [];
    return Object.entries(this.json.daily_reports)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, r]) => new DailyStorageReport(date, r));
  }

  getReport(date: string): DailyStorageReport | undefined {
    const r = this.json.daily_reports?.[date];
    return r ? new DailyStorageReport(date, r) : undefined;
  }

  // ─── Static constructors ────────────────────────────────────────────────────

  /**
   * Combine storage reports into one.
   *
   * Storage is a snapshot, not an amount, so two reports of the same project on
   * the same resource — two months, say — are never added up: the later one is
   * what is held now, and the earlier ones only add points to the series.
   * Reports of different projects or resources are different volumes held at
   * the same time, so those are summed, giving a cross-project total.
   */
  static combine(reports: ProjectStorageReport[]): ProjectStorageReport {
    if (reports.length === 0) throw new Error('Cannot combine empty array');
    if (reports.length === 1) return reports[0];

    // One report per project and resource: the latest snapshot, carrying the
    // whole series of every report in its group.
    const groups = new Map<string, ProjectStorageReport[]>();
    for (const r of reports) {
      const key = `${r.project}\u0000${r.resource}`;
      groups.set(key, [...(groups.get(key) ?? []), r]);
    }
    const latestPerGroup = [...groups.values()].map(latestOf);
    if (latestPerGroup.length === 1) {
      return latestPerGroup[0];
    }

    const users: Record<string, string> = {};
    for (const r of latestPerGroup) {
      Object.assign(users, r.json.users);
    }
    // What is held now is every group's latest snapshot, so the combined
    // report is dated by the latest of them.
    const latest = latestPerGroup.reduce((best, r) =>
      r.generatedAt > best.generatedAt ? r : best,
    );
    const daily_reports = combinedSeries(latestPerGroup);

    return new ProjectStorageReport(
      {
        ...latest.json,
        users,
        ...sumSnapshots(latestPerGroup.map((r) => r.json)),
        daily_reports:
          Object.keys(daily_reports).length > 0 ? daily_reports : undefined,
      },
      {
        ...latest.apiItem,
        resource: [...new Set(latestPerGroup.map((r) => r.resource))].join(
          ', ',
        ),
      },
    );
  }

  static fromApiResponse(item: StorageReportApiItem): ProjectStorageReport {
    return new ProjectStorageReport(item.report, item);
  }
}

/**
 * The report with its own top-level snapshot added to its series.
 *
 * The library writes the newest snapshot at the top level and only the earlier
 * ones in `daily_reports`, so a graph drawn from `daily_reports` stopped one
 * point short — and a report with a single snapshot had no series at all.
 */
const withLatestInSeries = (
  json: ProjectStorageReportJson,
): ProjectStorageReportJson => {
  if (!json.generated_at) return json;
  const { daily_reports, users: _users, ...latest } = json;
  return {
    ...json,
    daily_reports: {
      ...daily_reports,
      [json.generated_at.slice(0, 10)]: latest,
    },
  };
};

/**
 * Several reports of one project on one resource as one: the latest snapshot
 * as what is held now, and every snapshot of every report as the series.
 */
const latestOf = (group: ProjectStorageReport[]): ProjectStorageReport => {
  if (group.length === 1) return group[0];
  const latest = group.reduce((best, r) =>
    r.generatedAt > best.generatedAt ? r : best,
  );
  const users: Record<string, string> = {};
  const daily_reports: Record<string, DailyStorageReportJson> = {};
  for (const r of [...group].sort(
    (a, b) => a.generatedAt.getTime() - b.generatedAt.getTime(),
  )) {
    Object.assign(users, r.users);
    Object.assign(daily_reports, r.dailyJson());
  }
  return new ProjectStorageReport(
    { ...latest.rawJson(), users, daily_reports },
    latest.apiItem,
  );
};

type Snapshot = Pick<DailyStorageReportJson, 'project_quotas' | 'user_quotas'>;

const addUsage = (a: QuotaJson, b: QuotaJson): QuotaJson => ({
  ...a,
  usage: formatStorageBytes(
    parseStorageBytes(a.usage ?? '0 B') + parseStorageBytes(b.usage ?? '0 B'),
  ),
});

/**
 * Snapshots of different projects or resources, taken at the same time, as
 * one: usage is summed per volume, and per user and volume.
 */
const sumSnapshots = (snapshots: Snapshot[]): Snapshot => {
  const project_quotas: Snapshot['project_quotas'] = {};
  const user_quotas: Snapshot['user_quotas'] = {};
  for (const snapshot of snapshots) {
    for (const [vol, q] of Object.entries(snapshot.project_quotas)) {
      project_quotas[vol] = project_quotas[vol]
        ? addUsage(project_quotas[vol], q)
        : { ...q };
    }
    for (const [uid, vols] of Object.entries(snapshot.user_quotas)) {
      user_quotas[uid] ??= {};
      for (const [vol, q] of Object.entries(vols)) {
        user_quotas[uid][vol] = user_quotas[uid][vol]
          ? addUsage(user_quotas[uid][vol], q)
          : { ...q };
      }
    }
  }
  return { project_quotas, user_quotas };
};

/**
 * The series of several projects or resources as one, summed per date.
 *
 * Their snapshots are not taken on the same days, and a volume does not empty
 * on a day it was not measured, so on each date every report contributes its
 * latest snapshot up to that date. A report contributes nothing before its
 * first snapshot.
 */
const combinedSeries = (
  reports: ProjectStorageReport[],
): Record<string, DailyStorageReportJson> => {
  const series = reports.map((r) => r.dailyJson());
  const ownDates = series.map((s) => Object.keys(s).sort());
  const dates = [...new Set(ownDates.flat())].sort();
  const combined: Record<string, DailyStorageReportJson> = {};
  for (const date of dates) {
    const held: DailyStorageReportJson[] = [];
    series.forEach((s, i) => {
      const upTo = ownDates[i].filter((d) => d <= date);
      if (upTo.length > 0) held.push(s[upTo[upTo.length - 1]]);
    });
    const newest = held.reduce((best, d) =>
      d.generated_at > best.generated_at ? d : best,
    );
    combined[date] = { ...newest, ...sumSnapshots(held) };
  }
  return combined;
};
