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
    exportRow,
    exportFields,
    exportKeys,
    exportAll: true,
    filter,
  });
  const columns: Array<Column<Customer & { vm_count: string }>> = [
    {
      title: translate('Organization'),
      render: OrganizationLink,
    },
    {
      title: translate('Abbreviation'),
      render: AbbreviationField,
    },
    {
      title: translate('Created'),
      render: CreatedDateField,
    },
    {
      title: translate('VMs'),
      render: ({ row }) => <>{row.vm_count}</>,
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

const exportRow = (row: Customer & { vm_count: string }) => [
  row.name,
  row.abbreviation,
  formatDate(row.created),
  row.vm_count.toString(),
];

const exportFields = () => [
  translate('Organization'),
  translate('Abbreviation'),
  translate('Created'),
  translate('VMs'),
];

const exportKeys = ['name', 'abbreviation', 'created', 'vm_count'];
