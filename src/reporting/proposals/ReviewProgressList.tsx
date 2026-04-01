import { FC, useCallback, useMemo, useState } from 'react';

import { Badge } from '@waldur/core/Badge';
import { SummaryWidget } from '@waldur/core/SummaryWidget';
import { translate } from '@waldur/i18n';
import { ExpandableContainer } from '@waldur/table/ExpandableContainer';
import Table from '@waldur/table/Table';
import { Column } from '@waldur/table/types';

import { ReportingTitle } from '../ReportingTitle';

import { useReviewProgressStats } from './hooks';
import { calculateReviewProgressSummary } from './mockData';
import { ProposalAnalyticsButtons } from './ProposalAnalyticsButtons';
import { StatusBreakdown } from './StatusBreakdown';
import { ReviewProgressData } from './types';

const tableActions = (
  <ProposalAnalyticsButtons analyticsState="reporting-review-progress-analytics" />
);

const CompletionRateColumn: FC<{ row: ReviewProgressData }> = ({ row }) => {
  const rate = row.completion_rate;
  const variant = rate >= 75 ? 'success' : rate >= 50 ? 'warning' : 'danger';
  return (
    <Badge variant={variant} outline>
      {rate.toFixed(1)}%
    </Badge>
  );
};

const ReviewProgressExpandableRow: FC<{ row: ReviewProgressData }> = ({
  row,
}) => {
  const statuses = [
    {
      key: 'done',
      label: translate('Done'),
      value: row.completed,
      variant: 'outline-moss',
    },
    {
      key: 'active',
      label: translate('Active'),
      value: row.in_progress,
      variant: 'outline-success',
    },
    {
      key: 'pending',
      label: translate('Pending'),
      value: row.pending,
      variant: 'outline-warning',
    },
    {
      key: 'declined',
      label: translate('Declined'),
      value: row.declined,
      variant: 'outline-error',
      hidden: row.declined === 0,
    },
  ];

  return (
    <ExpandableContainer>
      <StatusBreakdown statuses={statuses} />
    </ExpandableContainer>
  );
};

const columns: Column<ReviewProgressData>[] = [
  {
    title: translate('Reviewer'),
    render: ({ row }) => (
      <div className="d-flex flex-column">
        <span className="fw-semibold">{row.reviewer_name}</span>
        <span className="text-muted fs-8">{row.reviewer_email}</span>
      </div>
    ),
  },
  {
    title: translate('Assigned'),
    render: ({ row }) => (
      <span className="fw-semibold">{row.total_assigned}</span>
    ),
  },
  {
    title: translate('Completion'),
    render: CompletionRateColumn,
  },
  {
    title: translate('Avg score'),
    render: ({ row }) => (
      <span className={row.average_score !== null ? '' : 'text-muted'}>
        {row.average_score !== null ? row.average_score.toFixed(1) : '—'}
      </span>
    ),
  },
  {
    title: translate('Avg days/review'),
    render: ({ row }) => (
      <span
        className={row.average_review_time_days !== null ? '' : 'text-muted'}
      >
        {row.average_review_time_days !== null
          ? row.average_review_time_days.toFixed(1)
          : '—'}
      </span>
    ),
  },
];

export const ReviewProgressList: FC = () => {
  const { data, isLoading, error, refetch } = useReviewProgressStats();
  const summary = useMemo(
    () => calculateReviewProgressSummary(Array.isArray(data) ? data : []),
    [data],
  );

  const [query, setQuery] = useState('');

  const filteredData = useMemo(() => {
    if (!Array.isArray(data)) return [];
    if (!query.trim()) return data;
    const searchLower = query.toLowerCase().trim();
    return data.filter(
      (item) =>
        item.reviewer_name.toLowerCase().includes(searchLower) ||
        item.reviewer_email.toLowerCase().includes(searchLower),
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
      <ReportingTitle reportKey="review-progress" />
      <SummaryWidget stats={summary} />

      <Table<ReviewProgressData>
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
        verboseName={translate('reviewers')}
        filterPosition="header"
        tableActions={tableActions}
        hideTitle
        hideRefresh
        expandableRow={ReviewProgressExpandableRow}
        toggleRow={toggleRow}
        toggled={toggled}
      />
    </>
  );
};
