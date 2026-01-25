import { FC, useCallback, useMemo, useState } from 'react';

import { Badge } from '@waldur/core/Badge';
import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';
import Table from '@waldur/table/Table';
import { Column } from '@waldur/table/types';

import { useReportBreadcrumbs } from '../ReportsBreadcrumbs';

import { generateResourceDemandData } from './mockData';
import { ProposalAnalyticsButtons } from './ProposalAnalyticsButtons';
import { ResourceDemandData } from './types';

const tableActions = (
  <ProposalAnalyticsButtons analyticsState="reporting-resource-demand-analytics" />
);

const ApprovalRateColumn: FC<{ row: ResourceDemandData }> = ({ row }) => {
  const total = row.approved_count + row.pending_count;
  const rate = total > 0 ? (row.approved_count / total) * 100 : 0;
  const variant = rate >= 70 ? 'success' : rate >= 40 ? 'warning' : 'danger';

  return (
    <div className="d-flex flex-column gap-1">
      <Badge variant={variant} outline>
        {rate.toFixed(0)}%
      </Badge>
      <span className="text-muted fs-8">
        {row.approved_count}/{total}
      </span>
    </div>
  );
};

const formatLimit = (key: string, value: number): string => {
  if (key.includes('_hours')) {
    return value >= 1000000
      ? `${(value / 1000000).toFixed(1)}M`
      : value >= 1000
        ? `${(value / 1000).toFixed(0)}K`
        : value.toString();
  }
  if (key.includes('_gb') || key.includes('_tb')) {
    return value >= 1000
      ? `${(value / 1000).toFixed(1)}T`
      : `${value}${key.includes('_tb') ? 'T' : 'G'}`;
  }
  return value.toString();
};

const LimitsColumn: FC<{
  row: ResourceDemandData;
  type: 'requested' | 'approved';
}> = ({ row, type }) => {
  const limits =
    type === 'requested'
      ? row.total_requested_limits
      : row.total_approved_limits;

  const entries = Object.entries(limits);
  if (entries.length === 0) return <span className="text-muted">—</span>;

  const displayEntries = entries.slice(0, 3);
  const hasMore = entries.length > 3;

  return (
    <div className="d-flex flex-wrap gap-1">
      {displayEntries.map(([key, value]) => {
        const label = key
          .replace(/_/g, ' ')
          .replace(/\b\w/g, (l) => l.toUpperCase());
        return (
          <Tip
            key={key}
            id={`${row.offering_uuid}-${type}-${key}`}
            label={label}
          >
            <Badge variant="default" outline className="fs-9">
              {formatLimit(key, value)}
            </Badge>
          </Tip>
        );
      })}
      {hasMore && (
        <Badge variant="default" outline className="fs-9">
          +{entries.length - 3}
        </Badge>
      )}
    </div>
  );
};

const columns: Column<ResourceDemandData>[] = [
  {
    title: translate('Offering'),
    render: ({ row }) => (
      <div className="d-flex flex-column">
        <span className="fw-semibold">{row.offering_name}</span>
        <span className="text-muted fs-8">{row.provider_name}</span>
      </div>
    ),
  },
  {
    title: translate('Type'),
    render: ({ row }) => (
      <Badge variant="primary" outline>
        {row.offering_type}
      </Badge>
    ),
  },
  {
    title: translate('Proposals'),
    render: ({ row }) => (
      <div className="d-flex flex-column">
        <span className="fw-semibold">{row.proposal_count}</span>
        <span className="text-muted fs-8">
          {row.request_count} {translate('requests')}
        </span>
      </div>
    ),
  },
  {
    title: translate('Approval'),
    render: ApprovalRateColumn,
  },
  {
    title: translate('Requested'),
    render: ({ row }) => <LimitsColumn row={row} type="requested" />,
  },
  {
    title: translate('Approved'),
    render: ({ row }) => <LimitsColumn row={row} type="approved" />,
  },
];

export const ResourceDemandList: FC = () => {
  useReportBreadcrumbs({
    currentReport: 'resource-demand',
    category: 'proposals',
  });

  const data = useMemo(() => generateResourceDemandData(), []);

  const summary = useMemo(() => {
    const totalProposals = data.reduce((sum, d) => sum + d.proposal_count, 0);
    const totalRequests = data.reduce((sum, d) => sum + d.request_count, 0);
    const totalApproved = data.reduce((sum, d) => sum + d.approved_count, 0);
    const totalPending = data.reduce((sum, d) => sum + d.pending_count, 0);
    const totalDecisions = totalApproved + totalPending;
    const approvalRate =
      totalDecisions > 0 ? (totalApproved / totalDecisions) * 100 : 0;

    // Count unique offering types
    const offeringTypes = new Set(data.map((d) => d.offering_type));

    return {
      offeringCount: data.length,
      offeringTypes: offeringTypes.size,
      totalProposals,
      totalRequests,
      totalApproved,
      totalPending,
      approvalRate: Math.round(approvalRate * 10) / 10,
    };
  }, [data]);

  const [query, setQuery] = useState('');

  const filteredData = useMemo(() => {
    if (!query.trim()) return data;
    const searchLower = query.toLowerCase().trim();
    return data.filter(
      (item) =>
        item.offering_name.toLowerCase().includes(searchLower) ||
        item.provider_name.toLowerCase().includes(searchLower) ||
        item.offering_type.toLowerCase().includes(searchLower),
    );
  }, [data, query]);

  const noop = useCallback(() => {}, []);

  const summaryWidget = useMemo(
    () => (
      <div className="d-flex flex-wrap gap-4 py-4 px-2">
        <div className="d-flex flex-column">
          <span className="fs-2 fw-bold text-primary">
            {summary.offeringCount}
          </span>
          <span className="text-muted fs-7">
            {translate('Offerings requested')}
          </span>
        </div>
        <div className="d-flex flex-column">
          <span className="fs-2 fw-bold">{summary.offeringTypes}</span>
          <span className="text-muted fs-7">{translate('Offering types')}</span>
        </div>
        <div className="d-flex flex-column">
          <span className="fs-2 fw-bold">{summary.totalRequests}</span>
          <span className="text-muted fs-7">{translate('Total requests')}</span>
        </div>
        <div className="d-flex flex-column">
          <span className="fs-2 fw-bold text-success">
            {summary.totalApproved}
          </span>
          <span className="text-muted fs-7">{translate('Approved')}</span>
        </div>
        <div className="d-flex flex-column">
          <span className="fs-2 fw-bold text-warning">
            {summary.totalPending}
          </span>
          <span className="text-muted fs-7">{translate('Pending')}</span>
        </div>
        <div className="d-flex flex-column">
          <span className="fs-2 fw-bold">{summary.approvalRate}%</span>
          <span className="text-muted fs-7">{translate('Approval rate')}</span>
        </div>
      </div>
    ),
    [summary],
  );

  return (
    <Table<ResourceDemandData>
      title={translate('Resource demand')}
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
      verboseName={translate('offerings')}
      filters={summaryWidget}
      filterPosition="header"
      tableActions={tableActions}
    />
  );
};
