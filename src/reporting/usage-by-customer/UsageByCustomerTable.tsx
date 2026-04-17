import { FC, useMemo } from 'react';
import { Col, Row } from 'react-bootstrap';
import { ResourceUsageByCustomer } from 'waldur-js-client';

import { ChartCard } from '@waldur/core/ChartCard';
import { defaultCurrency } from '@waldur/core/formatCurrency';
import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { SimpleTable } from '@waldur/table/SimpleTable';
import { Column } from '@waldur/table/types';
import { getSimpleExportData, renderFieldOrDash } from '@waldur/table/utils';

interface Props {
  data: ResourceUsageByCustomer[];
  componentTypes: string[];
  limitNames: string[];
}

export const UsageByCustomerTable: FC<Props> = ({
  data,
  componentTypes,
  limitNames,
}) => {
  const columns = useMemo<Column<ResourceUsageByCustomer>[]>(() => {
    const cols: Column<ResourceUsageByCustomer>[] = [
      {
        title: translate('Organization'),
        render: ({ row }) => (
          <Link
            state="organization.dashboard"
            params={{ uuid: row.customer_uuid }}
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
          <span className="fw-semibold">{row.resources_ok}</span>
        ),
        export: (row) => row.resources_ok,
      },
      {
        title: translate('Resources erred'),
        render: ({ row }) => (
          <span className={row.resources_erred > 0 ? 'fw-semibold' : ''}>
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
    <Row>
      <Col>
        <ChartCard
          title={translate('Usage by organization')}
          getExportData={() => getSimpleExportData(columns, data)}
          showPNG={false}
          isEmpty={!data || data.length === 0}
        >
          {() => (
            <SimpleTable<ResourceUsageByCustomer>
              columns={columns}
              rows={data}
            />
          )}
        </ChartCard>
      </Col>
    </Row>
  );
};
