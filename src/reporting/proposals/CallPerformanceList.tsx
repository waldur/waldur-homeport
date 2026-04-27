import { FC, useCallback, useMemo, useState } from 'react';

import { Badge } from '@/core/Badge';
import { formatDate } from '@/core/dateUtils';
import { SummaryWidget } from '@/core/SummaryWidget';
import { translate } from '@/i18n';
import { ExpandableContainer } from '@/table/ExpandableContainer';
import Table from '@/table/Table';
import { Column } from '@/table/types';

import { ReportingTitle } from '../ReportingTitle';

import { useCallPerformanceStats } from './hooks';
import { calculateCallPerformanceSummary } from './mockData';
import { ProposalAnalyticsButtons } from './ProposalAnalyticsButtons';
import { StatusBreakdown } from './StatusBreakdown';
import { CallPerformanceStat, CallStates } from './types';

const CallStateColumn: FC<{ row: CallPerformanceStat }> = ({ row }) => {
  const stateConfig: Record<CallStates, { variant: string; label: string }> = {
    active: { variant: 'outline-secondary', label: translate('Active') },
    draft: { variant: 'gray', label: translate('Draft') },
    archived: { variant: 'outline-default', label: translate('Archived') },
  };

  const config = stateConfig[row.state as CallStates];
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

const AcceptanceRateColumn: FC<{ row: CallPerformanceStat }> = ({ row }) => {
  const rate = row.acceptance_rate;
  const variant = rate >= 80 ? 'success' : rate >= 60 ? 'warning' : 'danger';
  return (
    <Badge variant={variant} outline>
      {rate.toFixed(1)}%
    </Badge>
  );
};

const ReviewProgressColumn: FC<{ row: CallPerformanceStat }> = ({ row }) => {
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
    </div>
  );
};

const columns: Column<CallPerformanceStat>[] = [
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
    render: ({ row }) => row.total_proposals,
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
    title: translate('Avg. score'),
    render: ({ row }) =>
      row.average_score !== null ? row.average_score.toFixed(1) : '—',
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

const CallPerformanceExpandableRow: FC<{ row: CallPerformanceStat }> = ({
  row,
}) => {
  return (
    <ExpandableContainer>
      <StatusBreakdown
        statuses={[
          {
            key: 'accepted',
            label: translate('Accepted'),
            value: row.proposals_accepted,
            variant: 'outline-secondary',
          },
          {
            key: 'in_review',
            label: translate('In review'),
            value: row.proposals_in_review,
            variant: 'outline-warning',
          },
          {
            key: 'rejected',
            label: translate('Rejected'),
            value: row.proposals_rejected,
            variant: 'outline-danger',
          },
        ]}
      />
    </ExpandableContainer>
  );
};

export const CallPerformanceList: FC = () => {
  const { data, isLoading, error, refetch } = useCallPerformanceStats();
  const summary = useMemo(
    () => calculateCallPerformanceSummary(Array.isArray(data) ? data : []),
    [data],
  );

  const [query, setQuery] = useState('');

  const filteredData = useMemo(() => {
    if (!Array.isArray(data)) return [];
    if (!query.trim()) return data;
    const searchLower = query.toLowerCase().trim();
    return data.filter(
      (item) =>
        item.call_name.toLowerCase().includes(searchLower) ||
        item.managing_organization_name.toLowerCase().includes(searchLower),
    );
  }, [data, query]);

  const noop = useCallback(() => {}, []);

  const [toggled, setToggled] = useState<Record<string, boolean>>({});

  const toggleRow = useCallback(
    (id: string) => {
      setToggled((prev) => ({ ...prev, [id]: !prev[id] }));
    },
    [setToggled],
  );

  return (
    <>
      <ReportingTitle reportKey="call-performance" />
      <SummaryWidget stats={summary} />

      <Table<CallPerformanceStat>
        columns={columns}
        rows={filteredData}
        fetch={() => refetch()}
        loading={isLoading}
        error={error}
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
        expandableRow={CallPerformanceExpandableRow}
        toggleRow={toggleRow}
        toggled={toggled}
      />
    </>
  );
};
