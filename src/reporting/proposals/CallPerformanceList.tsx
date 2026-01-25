import { CheckCircleIcon, ClockIcon, XCircleIcon } from '@phosphor-icons/react';
import { FC, useCallback, useMemo, useState } from 'react';

import { Badge } from '@waldur/core/Badge';
import { formatDate } from '@waldur/core/dateUtils';
import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';
import Table from '@waldur/table/Table';
import { Column } from '@waldur/table/types';

import { useReportBreadcrumbs } from '../ReportsBreadcrumbs';

import {
  calculateCallPerformanceSummary,
  generateCallPerformanceData,
} from './mockData';
import { ProposalAnalyticsButtons } from './ProposalAnalyticsButtons';
import { CallPerformanceData, CallState } from './types';

const tableActions = (
  <ProposalAnalyticsButtons analyticsState="reporting-call-performance-analytics" />
);

const CallStateColumn: FC<{ row: CallPerformanceData }> = ({ row }) => {
  const stateConfig: Record<
    CallState,
    { variant: 'success' | 'primary' | 'secondary'; label: string }
  > = {
    active: { variant: 'success', label: translate('Active') },
    draft: { variant: 'secondary', label: translate('Draft') },
    archived: { variant: 'primary', label: translate('Archived') },
  };

  const config = stateConfig[row.state];
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

const ProposalStatsColumn: FC<{ row: CallPerformanceData }> = ({ row }) => {
  return (
    <div className="d-flex flex-column gap-1">
      <div className="d-flex align-items-center gap-2">
        <span className="fw-semibold">{row.total_proposals}</span>
        <span className="text-muted fs-8">{translate('total')}</span>
      </div>
      <div className="d-flex gap-2 fs-8">
        <Tip id={`${row.call_uuid}-accepted`} label={translate('Accepted')}>
          <span className="text-success d-flex align-items-center gap-1">
            <CheckCircleIcon weight="bold" size={14} />
            {row.proposals_accepted}
          </span>
        </Tip>
        <Tip id={`${row.call_uuid}-review`} label={translate('In review')}>
          <span className="text-primary d-flex align-items-center gap-1">
            <ClockIcon weight="bold" size={14} />
            {row.proposals_in_review}
          </span>
        </Tip>
        <Tip id={`${row.call_uuid}-rejected`} label={translate('Rejected')}>
          <span className="text-danger d-flex align-items-center gap-1">
            <XCircleIcon weight="bold" size={14} />
            {row.proposals_rejected}
          </span>
        </Tip>
      </div>
    </div>
  );
};

const AcceptanceRateColumn: FC<{ row: CallPerformanceData }> = ({ row }) => {
  const rate = row.acceptance_rate;
  const variant = rate >= 80 ? 'success' : rate >= 60 ? 'warning' : 'danger';
  return (
    <Badge variant={variant} outline>
      {rate.toFixed(1)}%
    </Badge>
  );
};

const ReviewProgressColumn: FC<{ row: CallPerformanceData }> = ({ row }) => {
  const progress =
    row.total_reviews > 0
      ? Math.round((row.reviews_completed / row.total_reviews) * 100)
      : 0;

  return (
    <div className="d-flex flex-column gap-1">
      <div className="d-flex align-items-center gap-2">
        <span className="fw-semibold">
          {row.reviews_completed}/{row.total_reviews}
        </span>
        <span className="text-muted fs-8">({progress}%)</span>
      </div>
      {row.average_score !== null && (
        <span className="text-muted fs-8">
          {translate('Avg score')}: {row.average_score.toFixed(1)}
        </span>
      )}
    </div>
  );
};

const columns: Column<CallPerformanceData>[] = [
  {
    title: translate('Call'),
    render: ({ row }) => (
      <div className="d-flex flex-column">
        <span className="fw-semibold">{row.call_name}</span>
        <span className="text-muted fs-8">
          {row.managing_organization_name}
        </span>
      </div>
    ),
  },
  {
    title: translate('State'),
    render: CallStateColumn,
  },
  {
    title: translate('Proposals'),
    render: ProposalStatsColumn,
  },
  {
    title: translate('Acceptance'),
    render: AcceptanceRateColumn,
  },
  {
    title: translate('Reviews'),
    render: ReviewProgressColumn,
  },
  {
    title: translate('Last submission'),
    render: ({ row }) => (
      <span className="text-muted">
        {row.last_submission_date ? formatDate(row.last_submission_date) : '—'}
      </span>
    ),
  },
];

export const CallPerformanceList: FC = () => {
  useReportBreadcrumbs({
    currentReport: 'call-performance',
    category: 'proposals',
  });

  const data = useMemo(() => generateCallPerformanceData(), []);
  const summary = useMemo(() => calculateCallPerformanceSummary(data), [data]);

  const [query, setQuery] = useState('');

  const filteredData = useMemo(() => {
    if (!query.trim()) return data;
    const searchLower = query.toLowerCase().trim();
    return data.filter(
      (item) =>
        item.call_name.toLowerCase().includes(searchLower) ||
        item.managing_organization_name.toLowerCase().includes(searchLower),
    );
  }, [data, query]);

  const noop = useCallback(() => {}, []);

  const summaryWidget = useMemo(
    () => (
      <div className="d-flex flex-wrap gap-4 py-4 px-2">
        <div className="d-flex flex-column">
          <span className="fs-2 fw-bold text-primary">
            {summary.activeCalls}
          </span>
          <span className="text-muted fs-7">{translate('Active calls')}</span>
        </div>
        <div className="d-flex flex-column">
          <span className="fs-2 fw-bold">{summary.totalProposals}</span>
          <span className="text-muted fs-7">
            {translate('Total proposals')}
          </span>
        </div>
        <div className="d-flex flex-column">
          <span className="fs-2 fw-bold text-success">
            {summary.totalAccepted}
          </span>
          <span className="text-muted fs-7">{translate('Accepted')}</span>
        </div>
        <div className="d-flex flex-column">
          <span className="fs-2 fw-bold text-warning">
            {summary.totalInReview}
          </span>
          <span className="text-muted fs-7">{translate('In review')}</span>
        </div>
        <div className="d-flex flex-column">
          <span className="fs-2 fw-bold">{summary.overallAcceptanceRate}%</span>
          <span className="text-muted fs-7">
            {translate('Acceptance rate')}
          </span>
        </div>
        <div className="d-flex flex-column">
          <span className="fs-2 fw-bold">{summary.averageScore}</span>
          <span className="text-muted fs-7">
            {translate('Avg review score')}
          </span>
        </div>
      </div>
    ),
    [summary],
  );

  return (
    <Table<CallPerformanceData>
      title={translate('Call performance')}
      columns={columns}
      rows={filteredData}
      fetch={noop}
      loading={false}
      error={null}
      activeColumns={{}}
      columnPositions={[]}
      resetSelection={noop}
      setFilterPosition={noop}
      initColumnPositions={noop}
      resetPagination={noop}
      hasPagination={false}
      hasQuery
      query={query}
      setQuery={setQuery}
      verboseName={translate('calls')}
      filters={summaryWidget}
      filterPosition="header"
      tableActions={tableActions}
    />
  );
};
