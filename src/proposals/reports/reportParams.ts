import { DateTime } from 'luxon';

import { translate } from '@/i18n';
import { PageBarTab } from '@/navigation/types';

import { ReportFilters, ReportKind } from './types';

export const REPORT_KINDS: ReportKind[] = [
  'portfolio',
  'workflow',
  'reviewers',
  'rounds',
  'budgets',
];

const DEFAULT_REPORT: ReportKind = 'portfolio';

export const getReportTitle = (kind: ReportKind): string =>
  ({
    portfolio: translate('Portfolio'),
    workflow: translate('Workflow'),
    reviewers: translate('Reviewers'),
    rounds: translate('Rounds'),
    budgets: translate('Budgets'),
  })[kind];

/** One line under the report switcher: what the open report answers. */
export const getReportDescription = (kind: ReportKind): string =>
  ({
    portfolio: translate(
      'Proposals per call and round: how many were submitted, where they stand and how many were accepted.',
    ),
    workflow: translate(
      'Where proposals wait in the workflow: proposals at each step now, those past the step deadline, and how long the step takes.',
    ),
    reviewers: translate(
      'How reviewers answer their invitations and how fast they review.',
    ),
    rounds: translate(
      'How long each round takes from its cut-off to publishing results, and whether results came after the allocation date.',
    ),
    budgets: translate(
      'What each resource pool offers, what proposals ask for, and what has been awarded.',
    ),
  })[kind];

/** What the date range narrows in each report. */
export const getDateFilterHint = (kind: ReportKind): string =>
  ({
    portfolio: translate('Counts only proposals submitted between these days.'),
    workflow: translate('Counts only proposals submitted between these days.'),
    reviewers: translate(
      'Counts only reviews of proposals submitted between these days.',
    ),
    rounds: translate(
      'Lists only rounds whose submission window overlaps these days.',
    ),
    budgets: translate(
      'Budgets are offered per call and round, so the dates do not apply to this report.',
    ),
  })[kind];

/** Whether the submission dates narrow the report. */
export const reportUsesDates = (kind: ReportKind): boolean =>
  kind !== 'budgets';

export const parseReportKind = (value: unknown): ReportKind =>
  REPORT_KINDS.includes(value as ReportKind)
    ? (value as ReportKind)
    : DEFAULT_REPORT;

const toArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.filter(Boolean).map(String);
  }
  return value ? [String(value)] : [];
};

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** A day the calendar has: `2026-02-31` has the pattern, not the day. */
const toDate = (value: unknown): string | undefined =>
  typeof value === 'string' &&
  DATE_PATTERN.test(value) &&
  DateTime.fromISO(value).isValid
    ? value
    : undefined;

/** A uuid as the API takes it: 32 hex digits, with or without hyphens. */
const UUID_PATTERN =
  /^(?:[0-9a-f]{32}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;

const isUuid = (value: string) => UUID_PATTERN.test(value);

/**
 * The filters from the route's params (`organization`, `call`, `round`,
 * `from`, `to`). A
 * value the API would refuse -- a malformed uuid, a day the calendar has not
 * got -- is dropped here, as if the URL did not hold it, rather than turned
 * into a refused report. So is a lone start or end: the date picker shows a
 * range only with both, and a report narrowed by a date nobody can see would
 * not match the page.
 */
export const parseReportFilters = (
  params: Record<string, unknown>,
): ReportFilters => {
  const round = params?.round ? String(params.round) : undefined;
  const from = toDate(params?.from);
  const to = toDate(params?.to);
  const range = from && to;
  return {
    organizations: toArray(params?.organization).filter(isUuid),
    calls: toArray(params?.call).filter(isUuid),
    round: round && isUuid(round) ? round : undefined,
    from: range ? from : undefined,
    to: range ? to : undefined,
  };
};

/**
 * The route params for `filters`. An empty filter is written as `null`, so
 * navigating with these clears it from the URL instead of keeping the
 * previous value.
 */
export const serializeReportFilters = (filters: Partial<ReportFilters>) => {
  const params: Record<string, string | string[] | null> = {};
  if ('organizations' in filters) {
    params.organization = filters.organizations?.length
      ? filters.organizations
      : null;
  }
  if ('calls' in filters) {
    params.call = filters.calls?.length ? filters.calls : null;
  }
  if ('round' in filters) {
    params.round = filters.round || null;
  }
  if ('from' in filters) {
    params.from = filters.from || null;
  }
  if ('to' in filters) {
    params.to = filters.to || null;
  }
  return params;
};

export const hasActiveFilters = (filters: ReportFilters, kind: ReportKind) =>
  Boolean(
    filters.organizations?.length ||
    filters.calls.length ||
    filters.round ||
    (reportUsesDates(kind) && (filters.from || filters.to)),
  );

/**
 * The query of a report request. A call-level report has its call in the
 * path, and the budgets ignore the dates, so neither is sent where it does not
 * apply: the cached result is then shared whatever the URL holds.
 */
export const buildReportQuery = (
  kind: ReportKind,
  filters: ReportFilters,
  { callLevel, global = false }: { callLevel: boolean; global?: boolean },
) => {
  const query: {
    organisation_uuid?: string[];
    call_uuid?: string[];
    round_uuid?: string;
    submitted_from?: string;
    submitted_to?: string;
  } = {};
  if (global && filters.organizations?.length) {
    query.organisation_uuid = filters.organizations;
  }
  if (!callLevel && filters.calls.length) {
    query.call_uuid = filters.calls;
  }
  if (filters.round) {
    query.round_uuid = filters.round;
  }
  if (reportUsesDates(kind)) {
    if (filters.from) {
      query.submitted_from = filters.from;
    }
    if (filters.to) {
      query.submitted_to = filters.to;
    }
  }
  return query;
};

/**
 * The Reports tab's params on a call's Manage page, cleared: written on a
 * link out of the reports, so the report and its filters are not carried to
 * a page that has no use for them.
 */
export const CALL_REPORT_PARAMS_CLEARED = {
  report: null,
  round: null,
  from: null,
  to: null,
} as const;

/**
 * A call's Manage tabs, each but Reports clearing the reports' params on its
 * link: a tab link keeps the page's params, so leaving Reports for the
 * Dashboard would otherwise carry `report`, `round` and the dates along.
 */
export const leaveReportParamsBehind = <T extends PageBarTab>(tabs: T[]): T[] =>
  tabs.map((tab) =>
    tab.key === REPORTS_TAB
      ? tab
      : {
          ...tab,
          linkParams: { ...tab.linkParams, ...CALL_REPORT_PARAMS_CLEARED },
        },
  );

/** The key of the Reports tab on a call's Manage page. */
export const REPORTS_TAB = 'reports';
