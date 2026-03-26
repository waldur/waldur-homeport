import { FC, useMemo } from 'react';

import { defaultCurrency } from '@waldur/core/formatCurrency';
import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { SimpleTable } from '@waldur/table/SimpleTable';
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
        export: (row) => row.resources_erred,
      },
      {
        title: translate('Total resources'),
        render: ({ row }) => (
          <span className="fw-semibold">{row.resources_total}</span>
        ),
        export: (row) => row.resources_total,
      },
      {
        title: translate('Total cost'),
        render: ({ row }) => (
          <span className="fw-semibold">
            {defaultCurrency(parseFloat(row.total_cost))}
          </span>
        ),
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
    <SimpleTable<CustomerUsageRow>
      title={translate('Usage by organization')}
      columns={columns}
      rows={data}
    />
  );
};
