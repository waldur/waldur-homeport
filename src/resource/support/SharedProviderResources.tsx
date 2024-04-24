import { FC, useMemo } from 'react';

import { formatDateTime } from '@waldur/core/dateUtils';
import { OrganizationLink } from '@waldur/customer/list/OrganizationLink';
import { translate } from '@waldur/i18n';
import { Table, createFetcher } from '@waldur/table';
import { Column } from '@waldur/table/types';
import { useTable } from '@waldur/table/utils';

import { ResourceRowActions } from '../actions/ResourceRowActions';
import { ResourceName } from '../ResourceName';
import { ResourceState } from '../state/ResourceState';
import { Resource } from '../types';

interface CustomerResource extends Resource {
  customer_name: string;
  customer_uuid: string;
}

export const SharedProviderResources: FC<{ provider_uuid: string }> = ({
  provider_uuid,
}) => {
  const filter = useMemo(
    () => ({
      service_settings_uuid: provider_uuid,
    }),
    [provider_uuid],
  );
  const props = useTable({
    table: 'SharedProviderResources',
    fetchData: createFetcher('openstack-shared-settings-instances'),
    exportRow,
    exportFields,
    exportKeys,
    filter,
    exportAll: true,
  });
  const columns: Array<Column<CustomerResource>> = [
    {
      title: translate('Name'),
      render: ({ row }) => <ResourceName resource={row} />,
    },
    {
      title: translate('Organization'),
      render: ({ row }) => (
        <OrganizationLink
          row={{ uuid: row.customer_uuid, name: row.customer_name }}
        />
      ),
    },
    {
      title: translate('Created at'),
      render: ({ row }) => <>{formatDateTime(row.created)}</>,
    },
    {
      title: translate('State'),
      render: ({ row }) => <ResourceState resource={row} />,
    },
  ];

  return (
    <Table
      {...props}
      columns={columns}
      verboseName={translate('resources')}
      showPageSizeSelector={true}
      enableExport={true}
      hoverableRow={({ row }) => (
        <ResourceRowActions resource={row} refetch={props.fetch} />
      )}
    />
  );
};

const exportRow = (row: CustomerResource) => [
  row.name,
  row.customer_name,
  formatDateTime(row.created),
  row.resource_type,
  row.state,
];

const exportFields = () => [
  translate('Name'),
  translate('Organization'),
  translate('Created at'),
  translate('Type'),
  translate('State'),
];

const exportKeys = [
  'name',
  'customer_name',
  'created',
  'resource_type',
  'state',
];
