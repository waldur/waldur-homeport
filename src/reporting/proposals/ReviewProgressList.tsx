import { FC, useCallback, useMemo, useState } from 'react';

import { Badge } from '@waldur/core/Badge';
import { translate } from '@waldur/i18n';
import Table from '@waldur/table/Table';
import { Column } from '@waldur/table/types';

import { useReportBreadcrumbs } from '../ReportsBreadcrumbs';

import {
  calculateReviewProgressSummary,
  generateReviewProgressData,
} from './mockData';
import { ProposalAnalyticsButtons } from './ProposalAnalyticsButtons';
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

const ReviewStatsColumn: FC<{ row: ReviewProgressData }> = ({ row }) => {
  return (
    <div className="d-flex gap-3">
      <div className="d-flex flex-column text-center">
        <span className="fw-semibold text-success">{row.completed}</span>
        <span className="text-muted fs-9">{translate('Done')}</span>
      </div>
      <div className="d-flex flex-column text-center">
        <span className="fw-semibold text-primary">{row.in_progress}</span>
        <span className="text-muted fs-9">{translate('Active')}</span>
      </div>
      <div className="d-flex flex-column text-center">
        <span className="fw-semibold text-warning">{row.pending}</span>
        <span className="text-muted fs-9">{translate('Pending')}</span>
      </div>
      {row.declined > 0 && (
        <div className="d-flex flex-column text-center">
          <span className="fw-semibold text-danger">{row.declined}</span>
          <span className="text-muted fs-9">{translate('Declined')}</span>
        </div>
      )}
    </div>
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
    title: translate('Status breakdown'),
    render: ReviewStatsColumn,
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
    title: translate('Avg time'),
    render: ({ row }) => (
      <span
        className={row.average_review_time_days !== null ? '' : 'text-muted'}
      >
        {row.average_review_time_days !== null
          ? translate('{days} days', {
              days: row.average_review_time_days.toFixed(1),
            })
          : '—'}
      </span>
    ),
  },
];

export const ReviewProgressList: FC = () => {
  useReportBreadcrumbs({
    currentReport: 'review-progress',
    category: 'proposals',
  });

  const data = useMemo(() => generateReviewProgressData(), []);
  const summary = useMemo(() => calculateReviewProgressSummary(data), [data]);

  const [query, setQuery] = useState('');

  const filteredData = useMemo(() => {
    if (!query.trim()) return data;
    const searchLower = query.toLowerCase().trim();
    return data.filter(
      (item) =>
        item.reviewer_name.toLowerCase().includes(searchLower) ||
        item.reviewer_email.toLowerCase().includes(searchLower),
    );
  }, [data, query]);

  const noop = useCallback(() => {}, []);

  const summaryWidget = useMemo(
    () => (
      <div className="d-flex flex-wrap gap-4 py-4 px-2">
        <div className="d-flex flex-column">
          <span className="fs-2 fw-bold text-primary">
            {summary.totalReviewers}
          </span>
          <span className="text-muted fs-7">
            {translate('Active reviewers')}
          </span>
        </div>
        <div className="d-flex flex-column">
          <span className="fs-2 fw-bold">{summary.totalAssigned}</span>
          <span className="text-muted fs-7">{translate('Total assigned')}</span>
        </div>
        <div className="d-flex flex-column">
          <span className="fs-2 fw-bold text-success">
            {summary.totalCompleted}
          </span>
          <span className="text-muted fs-7">{translate('Completed')}</span>
        </div>
        <div className="d-flex flex-column">
          <span className="fs-2 fw-bold text-primary">
            {summary.totalInProgress}
          </span>
          <span className="text-muted fs-7">{translate('In progress')}</span>
        </div>
        <div className="d-flex flex-column">
          <span className="fs-2 fw-bold text-warning">
            {summary.totalPending}
          </span>
          <span className="text-muted fs-7">{translate('Pending')}</span>
        </div>
        <div className="d-flex flex-column">
          <span className="fs-2 fw-bold">{summary.overallCompletionRate}%</span>
          <span className="text-muted fs-7">
            {translate('Completion rate')}
          </span>
        </div>
        <div className="d-flex flex-column">
          <span className="fs-2 fw-bold">{summary.averageReviewTimeDays}</span>
          <span className="text-muted fs-7">
            {translate('Avg days/review')}
          </span>
        </div>
      </div>
    ),
    [summary],
  );

  return (
    <Table<ReviewProgressData>
      title={translate('Review progress')}
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
      verboseName={translate('reviewers')}
      filters={summaryWidget}
      filterPosition="header"
      tableActions={tableActions}
    />
  );
};
