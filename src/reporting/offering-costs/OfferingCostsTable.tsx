import { FC, useMemo } from 'react';
import { Col, Row } from 'react-bootstrap';
import { OfferingCost } from 'waldur-js-client';

import { ChartCard } from '@waldur/core/ChartCard';
import { defaultCurrency } from '@waldur/core/formatCurrency';
import { translate } from '@waldur/i18n';
import { SimpleTable } from '@waldur/table/SimpleTable';
import { Column } from '@waldur/table/types';
import { getSimpleExportData } from '@waldur/table/utils';

interface OfferingCostsTableProps {
  data: OfferingCost[];
}

const columns: Column<OfferingCost>[] = [
  {
    title: translate('Offering'),
    render: ({ row }) => (
      <span className="fw-semibold">{row.offering_name}</span>
    ),
    export: 'offering_name',
    exportTitle: translate('Offering'),
  },
  {
    title: translate('Cost'),
    render: ({ row }) => (
      <span className="fw-bold">{defaultCurrency(row.cost)}</span>
    ),
    export: (row) => defaultCurrency(row.cost),
    exportTitle: translate('Cost'),
  },
];

export const OfferingCostsTable: FC<OfferingCostsTableProps> = ({ data }) => {
  const sortedData = useMemo(
    () => [...data].sort((a, b) => b.cost - a.cost),
    [data],
  );

  return (
    <Row>
      <Col>
        <ChartCard
          title={translate('Offering costs')}
          getExportData={() => getSimpleExportData(columns, sortedData)}
          showPNG={false}
          isEmpty={!sortedData || sortedData.length === 0}
        >
          {() => (
            <SimpleTable<OfferingCost> columns={columns} rows={sortedData} />
          )}
        </ChartCard>
      </Col>
    </Row>
  );
};
