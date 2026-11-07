import { ArrowsClockwiseIcon } from '@phosphor-icons/react';
import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { FC, ReactNode, useCallback, useMemo } from 'react';

import {
  BaseButton,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardToolbar,
  TabNav,
} from 'waldur-ui';

import { Link } from '@/core/Link';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { NoResult } from '@/navigation/header/search/NoResult';

import {
  isBadRequest,
  isDateError,
  isNotFound,
  isOutOfScope,
  useReport,
  useReportScope,
} from './api';
import { BudgetsReportView } from './BudgetsReportView';
import { PortfolioReportView } from './PortfolioReportView';
import {
  getReportDescription,
  getReportTitle,
  hasActiveFilters,
  parseReportFilters,
  parseReportKind,
  REPORT_KINDS,
  serializeReportFilters,
} from './reportParams';
import { ReportsFilterBar } from './ReportsFilterBar';
import { ReviewersReportView } from './ReviewersReportView';
import { RoundsReportView } from './RoundsReportView';
import {
  ReportData,
  ReportFilters,
  ReportKind,
  ReportScope,
  ReportViewProps,
} from './types';
import { WorkflowReportView } from './WorkflowReportView';

const VIEWS: { [K in ReportKind]: FC<ReportViewProps<K>> } = {
  portfolio: PortfolioReportView,
  workflow: WorkflowReportView,
  reviewers: ReviewersReportView,
  rounds: RoundsReportView,
  budgets: BudgetsReportView,
};

/** Whether the report has nothing to show. */
const isReportEmpty = <K extends ReportKind>(
  kind: K,
  data: ReportData[K],
): boolean => {
  switch (kind) {
    case 'portfolio':
      return !(data as ReportData['portfolio']).totals.proposals;
    case 'workflow': {
      const workflow = data as ReportData['workflow'];
      return !workflow.proposals || !workflow.steps.length;
    }
    case 'reviewers':
      return !(data as ReportData['reviewers']).reviewers.length;
    case 'rounds':
      return !(data as ReportData['rounds']).rounds.length;
    case 'budgets':
      return !(data as ReportData['budgets']).pools.length;
  }
};

const getEmptyMessage = (kind: ReportKind): string =>
  ({
    portfolio: translate('No proposal has been made to these calls yet.'),
    workflow: translate('No proposal has reached a workflow step yet.'),
    reviewers: translate('No reviewer has been invited or assigned yet.'),
    rounds: translate('These calls have no rounds yet.'),
    budgets: translate(
      'These calls offer no resource pool, and no proposal has asked for resources yet.',
    ),
  })[kind];

interface ReportBodyProps {
  scope: ReportScope;
  kind: ReportKind;
  filters: ReportFilters;
  clearFilters(): void;
  report: ReturnType<typeof useReport>;
}

const ReportBody: FC<ReportBodyProps> = ({
  scope,
  kind,
  filters,
  clearFilters,
  report,
}) => {
  const { data, isLoading, error, refetch } = report;
  const filtered = hasActiveFilters(filters, kind);

  if (isLoading) {
    return <LoadingSpinner />;
  }
  if (error) {
    if (isNotFound(error) || isBadRequest(error)) {
      // A call or round outside the scope (an old or edited link), or dates
      // in the wrong order: the filters, not the page, are at fault.
      return (
        <NoResult
          title={translate('These filters do not match the reports')}
          message={
            isNotFound(error)
              ? translate(
                  'The chosen call or round is not one you can report on here.',
                )
              : isDateError(error)
                ? translate('The start date must not be after the end date.')
                : translate('These filters are not valid.')
          }
          callback={clearFilters}
          buttonTitle={translate('Clear filters')}
        />
      );
    }
    return (
      <LoadingErred
        message={translate('Unable to load the report.')}
        loadData={refetch}
      />
    );
  }
  if (!data) {
    return null;
  }
  if (isReportEmpty(kind, data)) {
    return filtered ? (
      <NoResult
        title={translate('Nothing matches these filters')}
        message={translate('Try other calls, another round or other dates.')}
        callback={clearFilters}
        buttonTitle={translate('Clear filters')}
      />
    ) : (
      <NoResult
        title={translate('Nothing to report yet')}
        message={getEmptyMessage(kind)}
        noAction
      />
    );
  }
  const View = VIEWS[kind] as FC<ReportViewProps<ReportKind>>;
  return <View data={data} scope={scope} filters={filters} />;
};

/**
 * The reports on a call-managing organization's calls, or on one call when
 * `scope.callUuid` is given. The open report and its filters live in the
 * URL's `report`, `call` (organization only), `round`, `from` and `to`.
 */
export const ReportsPage: FC<{ scope: ReportScope }> = ({ scope }) => {
  const router = useRouter();
  const { state, params } = useCurrentStateAndParams();
  const callLevel = Boolean(scope.callUuid);

  const kind = parseReportKind(params.report);
  // Only the reports across every organization filter by organization, and
  // only those above one call by call.
  const filters = useMemo(() => {
    const parsed = parseReportFilters(params);
    return {
      ...parsed,
      organizations: scope.global ? parsed.organizations : [],
      calls: callLevel ? [] : parsed.calls,
    };
  }, [params, callLevel, scope.global]);

  const setFilters = useCallback(
    (change: Partial<ReportFilters>) =>
      router.stateService.go(state.name, serializeReportFilters(change), {
        location: 'replace',
      }),
    [router, state.name],
  );
  const clearFilters = useCallback(
    () =>
      setFilters({
        // Only the reports across organizations have the param to clear.
        ...(scope.global ? { organizations: [] } : {}),
        calls: [],
        round: undefined,
        from: undefined,
        to: undefined,
      }),
    [setFilters, scope.global],
  );

  const reportScope = useReportScope(scope);
  const scopeReady =
    !reportScope.isLoading &&
    !(reportScope.error && !isOutOfScope(reportScope.error)) &&
    reportScope.calls.length > 0;
  // Asked for once the scope is known, here rather than in the body so the
  // card's Refresh can ask again: tiles, charts and table together.
  const report = useReport(scope, kind, filters, { enabled: scopeReady });

  let body: ReactNode;
  if (reportScope.isLoading) {
    body = <LoadingSpinner />;
  } else if (reportScope.error && !isOutOfScope(reportScope.error)) {
    body = (
      <LoadingErred
        message={translate('Unable to load the reports.')}
        loadData={reportScope.refetch}
      />
    );
  } else if (!reportScope.calls.length) {
    body = (
      <NoResult
        title={translate('No calls to report on')}
        message={
          callLevel
            ? translate('This call cannot be reported on.')
            : scope.global
              ? translate('No organization runs a call yet.')
              : translate(
                  'This organization has no call you can report on yet.',
                )
        }
        noAction
      />
    );
  } else {
    body = (
      <ReportBody
        scope={scope}
        kind={kind}
        filters={filters}
        clearFilters={clearFilters}
        report={report}
      />
    );
  }

  // The report switcher above, then one card per report: its title and
  // filters in the header, and every state of the report in the body, so
  // the page keeps one layout while it loads, fails or comes back empty.
  // `min-w-0` down the chain: a wide table scrolls inside the card instead
  // of stretching the page past it.
  return (
    <div className="min-w-0">
      <TabNav
        aria-label={translate('Reports')}
        activeKey={kind}
        listClassName="mb-5"
        items={REPORT_KINDS.map((key) => ({
          key,
          title: getReportTitle(key),
          link: <Link state={state.name} params={{ report: key }} />,
        }))}
      />
      <Card bordered className="min-w-0">
        <CardHeader className="gap-x-5 gap-y-3 py-4">
          <CardTitle as="div" className="flex-col items-start gap-1">
            <h3 className="mb-0">{getReportTitle(kind)}</h3>
            <span className="text-sm font-normal text-quaternary">
              {getReportDescription(kind)}
            </span>
          </CardTitle>
          {scopeReady && (
            <CardToolbar className="w-full gap-3 md:w-auto">
              <ReportsFilterBar
                kind={kind}
                filters={filters}
                onChange={setFilters}
                calls={reportScope.calls}
                callLevel={callLevel}
                global={scope.global}
              />
              <BaseButton
                variant="tertiary"
                size="lg"
                iconNode={<ArrowsClockwiseIcon weight="bold" />}
                tooltip={translate('Refresh')}
                pending={report.isFetching}
                disabled={report.isFetching}
                disabledReason={translate('The report is being fetched.')}
                onClick={() => report.refetch()}
              />
            </CardToolbar>
          )}
        </CardHeader>
        <CardContent className="min-w-0">{body}</CardContent>
      </Card>
    </div>
  );
};
