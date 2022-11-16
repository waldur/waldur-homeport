import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { ActionButtonResource } from '@waldur/resource/actions/ActionButtonResource';
import { ResourceState } from '@waldur/resource/state/ResourceState';
import { ResourceSummary } from '@waldur/resource/summary/ResourceSummary';
import { Table, connectTable, createFetcher } from '@waldur/table';
import { BooleanField } from '@waldur/table/BooleanField';

import { CreateNetworkAction } from '../openstack-tenant/actions/CreateNetworkAction';

const TableComponent: FunctionComponent<any> = (props) => {
  return (
    <Table
      {...props}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => <>{row.name}</>,
        },
        {
          title: translate('Subnets'),
          render: ({ row }) =>
            row.subnets
              .map((subnet) => `${subnet.name}: ${subnet.cidr}`)
              .join(', ') || 'N/A',
        },
        {
          title: translate('State'),
          render: ({ row }) => <ResourceState resource={row} />,
        },
        {
          title: translate('Is external'),
          render: ({ row }) => <BooleanField value={row.is_external} />,
        },
      ]}
      verboseName={translate('networks')}
      actions={<CreateNetworkAction resource={props.resource} />}
      hoverableRow={({ row }) => <ActionButtonResource url={row.url} />}
      expandableRow={({ row }) => <ResourceSummary resource={row} />}
    />
  );
};

const TableOptions = {
  table: 'openstack-networks',
  fetchData: createFetcher('openstack-networks'),
  mapPropsToFilter: (props) => ({
    tenant_uuid: props.resource.uuid,
  }),
};

export const TenantNetworksList = connectTable(TableOptions)(TableComponent);
