import { FC, useCallback, useMemo } from 'react';

import { defaultCurrency } from '@waldur/core/formatCurrency';
import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import Table from '@waldur/table/Table';
import { Column } from '@waldur/table/types';
import { renderFieldOrDash } from '@waldur/table/utils';

import { CustomerUsageRow } from './types';

interface Props {
  data: CustomerUsageRow[];
  componentTypes: string[];
  limitNames: string[];
}

export const UsageByCustomerTable: FC<Props> = ({
  data,
  componentTypes,
  limitNames,
}) => {
  const noop = useCallback(() => {}, []);

  const columns = useMemo<Column<CustomerUsageRow>[]>(() => {
    const cols: Column<CustomerUsageRow>[] = [
      {
        title: translate('Organization'),
        render: ({ row }) => (
          <Link
            state="organization.dashboard"
            params={{ uuid: row.customer_uuid }}
            className="text-dark fw-bold"
          >
            {row.customer_name}
          </Link>
        ),
        orderField: 'customer_name',
        export: (row) => row.customer_name,
      },
      {
        title: translate('Abbreviation'),
        render: ({ row }) => renderFieldOrDash(row.customer_abbreviation),
        export: (row) => row.customer_abbreviation || '',
      },
      {
        title: translate('Resources OK'),
        render: ({ row }) => (
          <span className="text-success fw-semibold">{row.resources_ok}</span>
        ),
        orderField: 'resources_ok',
        export: (row) => row.resources_ok,
      },
      {
        title: translate('Resources erred'),
        render: ({ row }) => (
          <span
            className={row.resources_erred > 0 ? 'text-danger fw-semibold' : ''}
          >
            {row.resources_erred}
          </span>
        ),
        orderField: 'resources_erred',
        export: (row) => row.resources_erred,
      },
      {
        title: translate('Total resources'),
        render: ({ row }) => (
          <span className="fw-semibold">{row.resources_total}</span>
        ),
        orderField: 'resources_total',
        export: (row) => row.resources_total,
      },
      {
        title: translate('Total cost'),
        render: ({ row }) => (
          <span className="fw-semibold">
            {defaultCurrency(parseFloat(row.total_cost))}
          </span>
        ),
        orderField: 'total_cost',
        export: (row) => row.total_cost,
      },
    ];

    // Add dynamic columns for component usages
    componentTypes.forEach((type) => {
      cols.push({
        title: `${type} ${translate('usage')}`,
        render: ({ row }) =>
          renderFieldOrDash(
            row.usages[type]
              ? parseFloat(row.usages[type]).toLocaleString()
              : null,
          ),
        export: (row) => row.usages[type] || '0',
      });
    });

    // Add dynamic columns for limits
    limitNames.forEach((name) => {
      cols.push({
        title: `${name} ${translate('limit')}`,
        render: ({ row }) =>
          renderFieldOrDash(
            row.limits[name] ? row.limits[name].toLocaleString() : null,
          ),
        export: (row) => row.limits[name] || 0,
      });
    });

    return cols;
  }, [componentTypes, limitNames]);

  return (
    <Table<CustomerUsageRow>
      title={translate('Usage by organization')}
      columns={columns}
      rows={data}
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
      verboseName={translate('organizations')}
      standalone
      initialSorting={{ field: 'resources_total', mode: 'desc' }}
      enableExport
    />
  );
};
