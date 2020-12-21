import { FunctionComponent } from 'react';

import { ResourceName } from '@waldur/resource/ResourceName';
import { ResourceState } from '@waldur/resource/state/ResourceState';
import { Table, connectTable, createFetcher } from '@waldur/table';

import { SetRoutersButton } from './SetRoutersButton';

const TableComponent: FunctionComponent<any> = (props) => {
  const { translate } = props;
  return (
    <Table
      {...props}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => <ResourceName resource={row} />,
        },
        {
          title: translate('State'),
          render: ({ row }) => <ResourceState resource={row} />,
        },
        {
          title: translate('Actions'),
          render: ({ row }) => <SetRoutersButton router={row} />,
        },
      ]}
      verboseName={translate('routers')}
    />
  );
};

const TableOptions = {
  table: 'openstack-routers',
  fetchData: createFetcher('openstack-routers'),
  mapPropsToFilter: (props) => ({
    tenant_uuid: props.resource.uuid,
  }),
};

export const TenantRoutersList = connectTable(TableOptions)(TableComponent);
