import { FC, useCallback, useMemo, useState } from 'react';

import { Badge } from '@waldur/core/Badge';
import { formatDate } from '@waldur/core/dateUtils';
import { SummaryWidget } from '@waldur/core/SummaryWidget';
import { translate } from '@waldur/i18n';
import { ExpandableContainer } from '@waldur/table/ExpandableContainer';
import Table from '@waldur/table/Table';
import { Column } from '@waldur/table/types';

import { useReportBreadcrumbs } from '../ReportsBreadcrumbs';

import {
  calculateCallPerformanceSummary,
  generateCallPerformanceData,
} from './mockData';
import { ProposalAnalyticsButtons } from './ProposalAnalyticsButtons';
import { StatusBreakdown } from './StatusBreakdown';
import { CallPerformanceData, CallState } from './types';

const CallStateColumn: FC<{ row: CallPerformanceData }> = ({ row }) => {
  const stateConfig: Record<CallState, { variant: string; label: string }> = {
    active: { variant: 'outline-secondary', label: translate('Active') },
    draft: { variant: 'gray', label: translate('Draft') },
    archived: { variant: 'outline-default', label: translate('Archived') },
  };

  const config = stateConfig[row.state];
  return <Badge variant={config.variant}>{config.label}</Badge>;
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

const CallPerformanceExpandableRow: FC<{ row: CallPerformanceData }> = ({
  row,
}) => {
  const statuses = [
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
  ];

  return (
    <ExpandableContainer>
      <StatusBreakdown statuses={statuses} />
    </ExpandableContainer>
  );
};

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

  const [toggled, setToggled] = useState<Record<string, boolean>>({});

  const toggleRow = useCallback(
    (id: string) => {
      setToggled((prev) => ({ ...prev, [id]: !prev[id] }));
    },
    [setToggled],
  );

  return (
    <>
      <div className="table-standalone-header">
        <h1 className="mb-0 fs-1x">{translate('Call performance')}</h1>
      </div>

      <SummaryWidget stats={summary} />

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
        expandableRow={CallPerformanceExpandableRow}
        toggleRow={toggleRow}
        toggled={toggled}
      />
    </>
  );
};
