import { FC, useCallback, useMemo, useState } from 'react';
import { Table as BootstrapTable } from 'react-bootstrap';

import { Badge } from '@waldur/core/Badge';
import { SummaryWidget } from '@waldur/core/SummaryWidget';
import { titleCase } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { getOfferingTypes } from '@waldur/marketplace/common/registry';
import { ExpandableContainer } from '@waldur/table/ExpandableContainer';
import Table from '@waldur/table/Table';
import { Column } from '@waldur/table/types';

import { useReportBreadcrumbs } from '../ReportsBreadcrumbs';

import { generateResourceDemandData } from './mockData';
import { ProposalAnalyticsButtons } from './ProposalAnalyticsButtons';
import { ResourceDemandData } from './types';

const ApprovalRateColumn: FC<{ row: ResourceDemandData }> = ({ row }) => {
  const total = row.approved_count + row.pending_count;
  const rate = total > 0 ? (row.approved_count / total) * 100 : 0;
  const variant = rate >= 70 ? 'success' : rate >= 40 ? 'warning' : 'danger';

  return (
    <Badge variant={variant} outline>
      {rate.toFixed(0)}%
    </Badge>
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

const ResourceDemandExpandableRow: FC<{ row: ResourceDemandData }> = ({
  row,
}) => {
  return (
    <ExpandableContainer>
      <p>
        <b>{translate('Proposals')}</b>: {row.proposal_count} /{' '}
        {row.request_count} {translate('requests')} ({row.approved_count}{' '}
        {translate('approved')} / {row.approved_count + row.pending_count}{' '}
        {translate('reviewed')})
      </p>

      <BootstrapTable className="table-row-bordered table-expandable table-rounded border border-gray-200 overflow-hidden">
        <thead className="align-middle">
          <tr>
            <th className="bg-gray-100">{translate('Metric')}</th>
            <th className="bg-gray-100">{translate('Requested')}</th>
            <th className="bg-gray-100">{translate('Approved')}</th>
          </tr>
        </thead>
        <tbody className="align-middle bg-white">
          {Object.keys(row.total_requested_limits).map((key) => (
            <tr key={key}>
              <td>
                <b>{titleCase(key.replace(/_/g, ' '))}</b>
              </td>
              <td>{formatLimit(key, row.total_requested_limits[key])}</td>
              <td>{formatLimit(key, row.total_approved_limits[key] || 0)}</td>
            </tr>
          ))}
        </tbody>
      </BootstrapTable>
    </ExpandableContainer>
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
    render: ({ row }) =>
      getOfferingTypes().find((op) => op.value === row.offering_type)?.label ||
      row.offering_type,
  },
  {
    title: translate('Proposals'),
    render: ({ row }) => row.proposal_count,
  },
  {
    title: translate('Approval'),
    render: ApprovalRateColumn,
  },
];

export const ResourceDemandList: FC = () => {
  useReportBreadcrumbs({
    currentReport: 'resource-demand',
    category: 'proposals',
  });

  const data = useMemo(() => generateResourceDemandData(), []);

  const summary = useMemo(() => {
    const totalRequests = data.reduce((sum, d) => sum + d.request_count, 0);
    const totalApproved = data.reduce((sum, d) => sum + d.approved_count, 0);
    const totalPending = data.reduce((sum, d) => sum + d.pending_count, 0);
    const totalDecisions = totalApproved + totalPending;
    const approvalRate =
      totalDecisions > 0 ? (totalApproved / totalDecisions) * 100 : 0;

    // Count unique offering types
    const offeringTypes = new Set(data.map((d) => d.offering_type));

    return [
      {
        label: translate('Offerings requested'),
        value: data.length,
      },
      {
        label: translate('Offering types'),
        value: offeringTypes.size,
      },
      {
        label: translate('Total requests'),
        value: totalRequests,
      },
      {
        label: translate('Approved'),
        value: totalApproved,
      },
      {
        label: translate('Pending'),
        value: totalPending,
      },
      {
        label: translate('Approval rate'),
        value: `${Math.round(approvalRate * 10) / 10}%`,
      },
    ];
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
        <h1 className="mb-0 fs-1x">{translate('Resource demand')}</h1>
      </div>

      <SummaryWidget stats={summary} />

      <Table<ResourceDemandData>
        title={translate('')}
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
        filterPosition="header"
        tableActions={
          <ProposalAnalyticsButtons analyticsState="reporting-resource-demand-analytics" />
        }
        hideTitle
        hideRefresh
        expandableRow={ResourceDemandExpandableRow}
        toggleRow={toggleRow}
        toggled={toggled}
      />
    </>
  );
};
