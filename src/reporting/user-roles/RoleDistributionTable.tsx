import { FC, useMemo } from 'react';
import { CustomerMemberCount } from 'waldur-js-client';

import { BooleanBadge } from '@waldur/core/BooleanBadge';
import { translate } from '@waldur/i18n';
import { SimpleTable } from '@waldur/table/SimpleTable';
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
      <span className="fw-bold text-primary">
        {row.count != null ? row.count.toLocaleString() : '—'}
      </span>
    ),
  },
  {
    title: translate('Has resources'),
    render: ({ row }) => <BooleanBadge value={row.has_resources} />,
  },
];

export const RoleDistributionTable: FC<RoleDistributionTableProps> = ({
  data,
}) => {
  const sortedData = useMemo(
    () => [...data].sort((a, b) => (b.count ?? 0) - (a.count ?? 0)),
    [data],
  );

  return (
    <SimpleTable<CustomerMemberCount>
      columns={columns}
      rows={sortedData}
      title={translate('Organization member counts')}
    />
  );
};
