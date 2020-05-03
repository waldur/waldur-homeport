import * as React from 'react';

import { formatDateTime } from '@waldur/core/dateUtils';
import { OrganizationLink } from '@waldur/customer/list/OrganizationLink';
import { translate } from '@waldur/i18n';
import { Table, connectTable, createFetcher } from '@waldur/table-react';
import { TableProps } from '@waldur/table-react/Table';
import { Column, TableOptionsType } from '@waldur/table-react/types';

import { ResourceRowActions } from '../actions/ResourceRowActions';
import { ResourceName } from '../ResourceName';
import { ResourceState } from '../state/ResourceState';
import { Resource } from '../types';

interface CustomerResource extends Resource {
  customer_name: string;
  customer_uuid: string;
}

const TableComponent = (
  props: TableProps<CustomerResource> & { provider_uuid: string },
) => {
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
    {
      title: translate('Actions'),
      render: ({ row }) => <ResourceRowActions resource={row} />,
    },
  ];

  return (
    <Table
      {...props}
      columns={columns}
      verboseName={translate('resources')}
      showPageSizeSelector={true}
      enableExport={true}
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

const mapPropsToFilter = props => ({
  service_settings_uuid: props.provider_uuid,
});

const TableOptions: TableOptionsType = {
  table: 'SharedProviderResources',
  fetchData: createFetcher('openstack-shared-settings-instances'),
  exportRow,
  exportFields,
  mapPropsToFilter,
  exportAll: true,
};

export const SharedProviderResources = connectTable(TableOptions)(
  TableComponent,
) as React.ComponentType<{ provider_uuid: string }>;
