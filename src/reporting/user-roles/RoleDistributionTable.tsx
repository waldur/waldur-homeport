import { FC, useMemo } from 'react';
import { CustomerMemberCount } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import Table from '@waldur/table/Table';
import { Column } from '@waldur/table/types';

interface RoleDistributionTableProps {
  data: CustomerMemberCount[];
}

const columns: Column<CustomerMemberCount>[] = [
  {
    title: translate('Organization'),
    render: ({ row }) => (
      <div>
        <span className="fw-semibold">{row.name}</span>
        {row.abbreviation && (
          <span className="text-muted ms-2">({row.abbreviation})</span>
        )}
      </div>
    ),
  },
  {
    title: translate('Members'),
    render: ({ row }) => (
      <span className="fw-bold text-primary">{row.count.toLocaleString()}</span>
    ),
  },
  {
    title: translate('Has resources'),
    render: ({ row }) => (
      <span
        className={`badge ${row.has_resources ? 'badge-light-success' : 'badge-light-secondary'}`}
      >
        {row.has_resources ? translate('Yes') : translate('No')}
      </span>
    ),
  },
];

export const RoleDistributionTable: FC<RoleDistributionTableProps> = ({
  data,
}) => {
  const sortedData = useMemo(
    () => [...data].sort((a, b) => b.count - a.count),
    [data],
  );

  const noop = () => {};

  return (
    <Table<CustomerMemberCount>
      columns={columns}
      rows={sortedData}
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
      title={translate('Organization member counts')}
      verboseName={translate('organizations')}
    />
  );
};
