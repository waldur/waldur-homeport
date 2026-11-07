import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import {
  callManagingOrganisationsReportsBudgetsGlobalRetrieve,
  callManagingOrganisationsReportsBudgetsRetrieve,
  callManagingOrganisationsReportsPortfolioGlobalRetrieve,
  callManagingOrganisationsReportsPortfolioRetrieve,
  callManagingOrganisationsReportsReviewersGlobalRetrieve,
  callManagingOrganisationsReportsReviewersRetrieve,
  callManagingOrganisationsReportsRoundsGlobalRetrieve,
  callManagingOrganisationsReportsRoundsRetrieve,
  callManagingOrganisationsReportsWorkflowGlobalRetrieve,
  callManagingOrganisationsReportsWorkflowRetrieve,
  proposalProtectedCallsReportsBudgetsRetrieve,
  proposalProtectedCallsReportsPortfolioRetrieve,
  proposalProtectedCallsReportsReviewersRetrieve,
  proposalProtectedCallsReportsRoundsRetrieve,
  proposalProtectedCallsReportsWorkflowRetrieve,
} from 'waldur-js-client';

import { SHORT_STALE_TIME } from '@/core/constants';

import { buildReportQuery } from './reportParams';
import { ReportData, ReportFilters, ReportKind, ReportScope } from './types';

type Fetcher = (options: {
  path?: { uuid: string };
  query?: Record<string, unknown>;
}) => Promise<{ data?: unknown }>;

/** Across every call-managing organization: staff and support only. */
const GLOBAL_FETCHERS: Record<ReportKind, Fetcher> = {
  portfolio: callManagingOrganisationsReportsPortfolioGlobalRetrieve,
  workflow: callManagingOrganisationsReportsWorkflowGlobalRetrieve,
  reviewers: callManagingOrganisationsReportsReviewersGlobalRetrieve,
  rounds: callManagingOrganisationsReportsRoundsGlobalRetrieve,
  budgets: callManagingOrganisationsReportsBudgetsGlobalRetrieve,
} as Record<ReportKind, Fetcher>;

const ORGANIZATION_FETCHERS: Record<ReportKind, Fetcher> = {
  portfolio: callManagingOrganisationsReportsPortfolioRetrieve,
  workflow: callManagingOrganisationsReportsWorkflowRetrieve,
  reviewers: callManagingOrganisationsReportsReviewersRetrieve,
  rounds: callManagingOrganisationsReportsRoundsRetrieve,
  budgets: callManagingOrganisationsReportsBudgetsRetrieve,
} as Record<ReportKind, Fetcher>;

const CALL_FETCHERS: Record<ReportKind, Fetcher> = {
  portfolio: proposalProtectedCallsReportsPortfolioRetrieve,
  workflow: proposalProtectedCallsReportsWorkflowRetrieve,
  reviewers: proposalProtectedCallsReportsReviewersRetrieve,
  rounds: proposalProtectedCallsReportsRoundsRetrieve,
  budgets: proposalProtectedCallsReportsBudgetsRetrieve,
} as Record<ReportKind, Fetcher>;

const NO_FILTERS: ReportFilters = { organizations: [], calls: [] };

/** The statuses the reports explain in the page rather than leave it for. */
const REPORT_ERROR_STATUSES = [400, 403, 404];

const getReportQueryKey = (
  scope: ReportScope,
  kind: ReportKind,
  query: object,
) => [
  'call-reports',
  scope.global ? 'global' : scope.callUuid ? 'call' : 'organization',
  scope.global ? null : (scope.callUuid ?? scope.organizationUuid),
  kind,
  query,
];

const fetchReport = <K extends ReportKind>(
  scope: ReportScope,
  kind: K,
  filters: ReportFilters,
): Promise<ReportData[K]> => {
  const callLevel = Boolean(scope.callUuid);
  const query = buildReportQuery(kind, filters, {
    callLevel,
    global: scope.global,
  });
  if (scope.global) {
    return GLOBAL_FETCHERS[kind]({ query }).then(
      (response) => response.data as ReportData[K],
    );
  }
  const fetcher = callLevel ? CALL_FETCHERS[kind] : ORGANIZATION_FETCHERS[kind];
  return fetcher({
    path: { uuid: callLevel ? scope.callUuid : scope.organizationUuid },
    query,
  }).then((response) => response.data as ReportData[K]);
};

/**
 * One report of the scope. Not kept across a change of filters: the report
 * views mount their tables with the rows in hand, so a table never exports
 * the rows of the previous filters.
 */
export const useReport = <K extends ReportKind>(
  scope: ReportScope,
  kind: K,
  filters: ReportFilters,
  { enabled = true }: { enabled?: boolean } = {},
) => {
  const query = buildReportQuery(kind, filters, {
    callLevel: Boolean(scope.callUuid),
    global: scope.global,
  });
  return useQuery({
    queryKey: getReportQueryKey(scope, kind, query),
    queryFn: () => fetchReport(scope, kind, filters),
    staleTime: SHORT_STALE_TIME,
    refetchOnWindowFocus: false,
    enabled,
    // A 404 is a call or round outside the scope, a 400 filters the API
    // refuses, a 403 a scope the user may not report on: asking again
    // changes none of them.
    retry: (failureCount, error: any) =>
      !REPORT_ERROR_STATUSES.includes(
        error?.response?.status ?? error?.status,
      ) && failureCount < 2,
    // The page explains these itself, with a way out; the app's handler
    // would otherwise send a 404 to the Not Found page. The scope query
    // goes through here too, with the same statuses.
    meta: { handlesErrorStatuses: REPORT_ERROR_STATUSES },
  });
};

interface ScopeRound {
  uuid: string;
  name: string;
}

export interface ScopeCall {
  uuid: string;
  name: string;
  /** The call-managing organization running the call. */
  organizationUuid: string;
  organizationName: string;
  rounds: ScopeRound[];
}

/**
 * The calls and rounds the reports can cover, for the filters: the unfiltered
 * portfolio lists every call in scope with its rounds, those without proposals
 * too. It shares its cache entry with an unfiltered portfolio report.
 */
export const useReportScope = (scope: ReportScope) => {
  const { data, ...rest } = useReport(scope, 'portfolio', NO_FILTERS);
  const calls = useMemo<ScopeCall[]>(
    () =>
      (data?.calls ?? []).map((call) => ({
        uuid: call.call_uuid,
        name: call.call_name,
        organizationUuid: call.organisation_uuid,
        organizationName: call.organisation_name,
        rounds: call.rounds.map((round) => ({
          uuid: round.round_uuid,
          name: round.round_name,
        })),
      })),
    [data],
  );
  return { calls, loaded: Boolean(data), ...rest };
};

export const isNotFound = (error: any) =>
  (error?.response?.status ?? error?.status) === 404;

export const isBadRequest = (error: any) =>
  (error?.response?.status ?? error?.status) === 400;

/** A scope the user may not report on (403), or that is gone (404). */
export const isOutOfScope = (error: any) =>
  [403, 404].includes(error?.response?.status ?? error?.status);

/** A 400 on the submission dates: the only one the URL can still cause once
 * malformed uuids and impossible days are dropped is an end before a start. */
export const isDateError = (error: any) =>
  isBadRequest(error) &&
  ['submitted_from', 'submitted_to'].some(
    (field) => error?.[field] ?? error?.data?.[field],
  );
