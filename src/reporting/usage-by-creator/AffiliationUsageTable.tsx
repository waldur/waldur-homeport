import { FC, useMemo } from 'react';
import { Col, Row } from 'react-bootstrap';

import { ChartCard } from '@/core/ChartCard';
import { defaultCurrency } from '@/core/formatCurrency';
import { translate } from '@/i18n';
import { SimpleTable } from '@/table/SimpleTable';
import { Column } from '@/table/types';
import { getSimpleExportData, renderFieldOrDash } from '@/table/utils';

import { AffiliationAggregation } from './types';

interface Props {
  data: AffiliationAggregation[];
  componentTypes: string[];
}

export const AffiliationUsageTable: FC<Props> = ({ data, componentTypes }) => {
  const columns = useMemo<Column<AffiliationAggregation>[]>(() => {
    const cols: Column<AffiliationAggregation>[] = [
      {
        title: translate('Affiliation'),
        render: ({ row }) => <span className="fw-bold">{row.affiliation}</span>,
        export: (row) => row.affiliation,
      },
      {
        title: translate('Total resources'),
        render: ({ row }) => (
          <span className="fw-semibold">
            {row.total_resources.toLocaleString()}
          </span>
        ),
        export: (row) => row.total_resources,
      },
      {
        title: translate('Total usage'),
        render: ({ row }) => (
          <span className="fw-semibold">
            {row.total_usage.toLocaleString()}
          </span>
        ),
        export: (row) => row.total_usage,
      },
      {
        title: translate('Total cost'),
        render: ({ row }) => (
          <span className="fw-semibold">{defaultCurrency(row.total_cost)}</span>
        ),
        export: (row) => row.total_cost,
      },
    ];

    // Add dynamic columns for each component type
    componentTypes.forEach((type) => {
      cols.push({
        title: type,
        render: ({ row }) =>
          renderFieldOrDash(
            row.components[type] ? row.components[type].toLocaleString() : null,
          ),
        export: (row) => row.components[type] || 0,
      });
    });

    return cols;
  }, [componentTypes]);

  return (
    <Row>
      <Col>
        <ChartCard
          title={translate('Usage by affiliation')}
          getExportData={() => getSimpleExportData(columns, data)}
          showPNG={false}
          isEmpty={!data || data.length === 0}
        >
          {() => (
            <SimpleTable<AffiliationAggregation>
              columns={columns}
              rows={data}
            />
          )}
        </ChartCard>
      </Col>
    </Row>
  );
};
