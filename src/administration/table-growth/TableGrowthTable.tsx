import { FC, useEffect, useMemo } from 'react';
import { Tooltip } from 'react-bootstrap';

import { formatFilesize } from '@/core/utils';
import { translate } from '@/i18n';
import { createClientPaginatedFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import type { TableGrowthStats, TableGrowthStatsResponse } from './api';
import {
  formatGrowthPercent,
  getAlertedTableNames,
  getGrowthClass,
  TableAlert,
} from './utils';

interface TableGrowthTableProps {
  data: TableGrowthStatsResponse;
  alerts: TableAlert[];
}

export const TableGrowthTable: FC<TableGrowthTableProps> = ({
  data,
  alerts,
}) => {
  const alertedTables = useMemo(() => getAlertedTableNames(alerts), [alerts]);

  const tableProps = useTable({
    table: 'TableGrowthStats',
    fetchData: createClientPaginatedFetcher(data.tables, {
      queryField: 'table_name',
    }),
    queryField: 'table_name',
  });

  // Refetch when the polled stats change
  useEffect(() => {
    tableProps.fetch();
  }, [data.tables]);

  const columns = useMemo(
    () => [
      {
        title: translate('Table name'),
        render: ({ row }: { row: TableGrowthStats }) => (
          <code>{row.table_name}</code>
        ),
        orderField: 'table_name',
        id: 'table_name',
      },
      {
        title: translate('Total size'),
        render: ({ row }: { row: TableGrowthStats }) => (
          <Tooltip id={`total-${row.table_name}`}>
            <span title={`${row.current_total_size} B`}>
              {formatFilesize(row.current_total_size, 'B')}
            </span>
          </Tooltip>
        ),
        orderField: 'current_total_size',
        id: 'current_total_size',
        className: 'text-end',
      },
      {
        title: translate('Data size'),
        render: ({ row }: { row: TableGrowthStats }) => (
          <span title={`${row.current_data_size} B`}>
            {formatFilesize(row.current_data_size, 'B')}
          </span>
        ),
        orderField: 'current_data_size',
        id: 'current_data_size',
        className: 'text-end',
      },
      {
        title: translate('Rows'),
        render: ({ row }: { row: TableGrowthStats }) =>
          row.current_row_estimate != null
            ? row.current_row_estimate.toLocaleString()
            : renderFieldOrDash(null),
        orderField: 'current_row_estimate',
        id: 'current_row_estimate',
        className: 'text-end',
      },
      {
        title: translate('Weekly size growth'),
        render: ({ row }: { row: TableGrowthStats }) => (
          <span
            className={getGrowthClass(
              row.weekly_growth_percent,
              data.weekly_threshold_percent,
            )}
          >
            {formatGrowthPercent(row.weekly_growth_percent)}
          </span>
        ),
        orderField: 'weekly_growth_percent',
        id: 'weekly_growth_percent',
        className: 'text-end',
      },
      {
        title: translate('Monthly size growth'),
        render: ({ row }: { row: TableGrowthStats }) => (
          <span
            className={getGrowthClass(
              row.monthly_growth_percent,
              data.monthly_threshold_percent,
            )}
          >
            {formatGrowthPercent(row.monthly_growth_percent)}
          </span>
        ),
        orderField: 'monthly_growth_percent',
        id: 'monthly_growth_percent',
        className: 'text-end',
      },
      {
        title: translate('Weekly row growth'),
        render: ({ row }: { row: TableGrowthStats }) => (
          <span
            className={getGrowthClass(
              row.weekly_row_growth_percent,
              data.weekly_threshold_percent,
            )}
          >
            {formatGrowthPercent(row.weekly_row_growth_percent)}
          </span>
        ),
        orderField: 'weekly_row_growth_percent',
        id: 'weekly_row_growth_percent',
        className: 'text-end',
      },
      {
        title: translate('Monthly row growth'),
        render: ({ row }: { row: TableGrowthStats }) => (
          <span
            className={getGrowthClass(
              row.monthly_row_growth_percent,
              data.monthly_threshold_percent,
            )}
          >
            {formatGrowthPercent(row.monthly_row_growth_percent)}
          </span>
        ),
        orderField: 'monthly_row_growth_percent',
        id: 'monthly_row_growth_percent',
        className: 'text-end',
      },
    ],
    [data.weekly_threshold_percent, data.monthly_threshold_percent],
  );

  return (
    <Table<TableGrowthStats>
      {...tableProps}
      columns={columns}
      verboseName={translate('tables')}
      hasQuery
      initialSorting={{ field: 'weekly_growth_percent', mode: 'desc' }}
      rowClass={({ row }) =>
        alertedTables.has(row.table_name) ? 'table-warning' : ''
      }
      hasActionBar={false}
      hoverShadow={false}
    />
  );
};
