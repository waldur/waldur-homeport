import { FC, useMemo } from 'react';
import { Col, Row } from 'react-bootstrap';

import { ChartCard } from '@/core/ChartCard';
import { translate } from '@/i18n';
import { SimpleTable } from '@/table/SimpleTable';
import { Column } from '@/table/types';
import { getSimpleExportData } from '@/table/utils';

interface ProvisioningByTypeTableProps {
  byType: { [key: string]: number };
}

interface TypeRow {
  type: string;
  count: number;
}

const TYPE_LABELS: { [key: string]: string } = {
  Create: translate('Create'),
  Update: translate('Update'),
  Terminate: translate('Terminate'),
};

const columns: Column<TypeRow>[] = [
  {
    title: translate('Order type'),
    render: ({ row }) => (
      <span className="fw-semibold">{TYPE_LABELS[row.type] || row.type}</span>
    ),
  },
  {
    title: translate('Count'),
    render: ({ row }) => (
      <span className="fw-bold">{row.count.toLocaleString()}</span>
    ),
  },
];

export const ProvisioningByTypeTable: FC<ProvisioningByTypeTableProps> = ({
  byType,
}) => {
  const tableData = useMemo(() => {
    return Object.entries(byType)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);
  }, [byType]);

  return (
    <Row>
      <Col>
        <ChartCard
          title={translate('Orders by type')}
          getExportData={() => getSimpleExportData(columns, tableData)}
          showPNG={false}
          isEmpty={!tableData || tableData.length === 0}
        >
          {() => <SimpleTable columns={columns} rows={tableData} />}
        </ChartCard>
      </Col>
    </Row>
  );
};
