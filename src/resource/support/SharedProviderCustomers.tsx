import { FC, useMemo } from 'react';

import { formatDate } from '@waldur/core/dateUtils';
import { OrganizationLink } from '@waldur/customer/list/OrganizationLink';
import { translate } from '@waldur/i18n';
import { createFetcher, Table } from '@waldur/table';
import { Column } from '@waldur/table/types';
import { renderFieldOrDash, useTable } from '@waldur/table/utils';
import { Customer } from '@waldur/workspace/types';

const AbbreviationField = ({ row }) => (
  <>{renderFieldOrDash(row.abbreviation)}</>
);

const CreatedDateField = ({ row }) => (
  <>{renderFieldOrDash(formatDate(row.created))}</>
);

export const SharedProviderCustomers: FC<{ provider_uuid: string }> = ({
  provider_uuid,
}) => {
  const filter = useMemo(
    () => ({
      service_settings_uuid: provider_uuid,
    }),
    [provider_uuid],
  );
  const props = useTable({
    table: 'SharedProviderCustomers',
    fetchData: createFetcher('openstack-shared-settings-customers'),
    filter,
  });
  const columns: Array<Column<Customer & { vm_count: string }>> = [
    {
      title: translate('Organization'),
      render: OrganizationLink,
      export: 'name',
    },
    {
      title: translate('Abbreviation'),
      render: AbbreviationField,
      export: 'abbreviation',
    },
    {
      title: translate('Created'),
      render: CreatedDateField,
      export: (row) => formatDate(row.created),
      exportKeys: ['created'],
    },
    {
      title: translate('VMs'),
      render: ({ row }) => <>{row.vm_count}</>,
      export: (row) => row.vm_count.toString(),
      exportKeys: ['vm_count'],
    },
  ];

  return (
    <Table
      {...props}
      columns={columns}
      verboseName={translate('organizations')}
      showPageSizeSelector={true}
      enableExport={true}
    />
  );
};
