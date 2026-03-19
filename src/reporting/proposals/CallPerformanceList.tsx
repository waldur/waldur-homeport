import { CheckCircleIcon, ClockIcon, XCircleIcon } from '@phosphor-icons/react';
import { FC, useCallback, useMemo, useState } from 'react';
import { Col, Row } from 'react-bootstrap';

import { Badge } from '@waldur/core/Badge';
import { formatDate } from '@waldur/core/dateUtils';
import { StatsCard } from '@waldur/core/StatsCard';
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

const SummaryWidget: FC<{ summary }> = ({ summary }) => (
  <Row className="g-4 mb-6">
    <Col xs={12} sm={6} lg={2}>
      <StatsCard
        label={translate('Active calls')}
        value={summary.activeCalls}
      />
    </Col>
    <Col xs={12} sm={6} lg={2}>
      <StatsCard
        label={translate('Total proposals')}
        value={summary.totalProposals}
      />
    </Col>
    <Col xs={12} sm={6} lg={2}>
      <StatsCard label={translate('Accepted')} value={summary.totalAccepted} />
    </Col>
    <Col xs={12} sm={6} lg={2}>
      <StatsCard label={translate('In review')} value={summary.totalInReview} />
    </Col>
    <Col xs={12} sm={6} lg={2}>
      <StatsCard
        label={translate('Acceptance rate')}
        value={`${summary.overallAcceptanceRate}%`}
      />
    </Col>
    <Col xs={12} sm={6} lg={2}>
      <StatsCard
        label={translate('Avg review score')}
        value={summary.averageScore}
      />
    </Col>
  </Row>
);

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

  return (
    <>
      <div className="table-standalone-header d-flex justify-content-between gap-4">
        <h1 className="mb-0 fs-1x">{translate('Call performance')}</h1>
      </div>

      <SummaryWidget summary={summary} />
      <Table<CallPerformanceData>
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
        hideTitle
        hideRefresh
        filterPosition="header"
        tableActions={
          <ProposalAnalyticsButtons analyticsState="reporting-call-performance-analytics" />
        }
      />
    </>
  );
};
