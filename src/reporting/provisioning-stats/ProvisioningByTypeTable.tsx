import { FC, useMemo } from 'react';

import { translate } from '@waldur/i18n';
import Table from '@waldur/table/Table';
import { Column } from '@waldur/table/types';

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
      <span className="fw-bold text-primary">{row.count.toLocaleString()}</span>
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

  const noop = () => {};

  return (
    <Table<TypeRow>
      columns={columns}
      rows={tableData}
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
      title={translate('Orders by type')}
      verboseName={translate('order types')}
    />
  );
};
