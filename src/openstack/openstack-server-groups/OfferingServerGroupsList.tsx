import { FunctionComponent } from 'react';
import {
  OpenStackServerGroup,
  openstackServerGroupsList,
  OpenstackServerGroupsListData,
} from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { ResourceState } from '@waldur/resource/state/ResourceState';
import { createFetcher } from '@waldur/table/api';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';

export const OfferingServerGroupsList: FunctionComponent<{
  filter: OpenstackServerGroupsListData['query'];
}> = ({ filter }) => {
  const props = useTable({
    table: 'openstack-offering-server-groups',
    fetchData: createFetcher(openstackServerGroupsList),
    filter,
    queryField: 'name',
  });

  return (
    <Table<OpenStackServerGroup>
      {...props}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => row.name,
          copyField: (row) => row.name,
          id: 'name',
          keys: ['name'],
        },
        {
          title: translate('Policy'),
          render: ({ row }) => row.policy || DASH_ESCAPE_CODE,
          id: 'policy',
          orderField: 'policy',
          keys: ['policy'],
        },
        {
          title: translate('Tenant'),
          render: ({ row }) => row.tenant_name || DASH_ESCAPE_CODE,
          id: 'tenant_name',
          keys: ['tenant_name'],
        },
        {
          title: translate('State'),
          render: ({ row }) => <ResourceState resource={row} />,
          id: 'state',
          keys: ['state'],
        },
        {
          title: translate('Backend ID'),
          render: ({ row }) => <>{row.backend_id || DASH_ESCAPE_CODE}</>,
          id: 'backend_id',
          optional: true,
          keys: ['backend_id'],
          copyField: (row) => row.backend_id,
        },
        {
          title: translate('UUID'),
          render: ({ row }) => <>{row.uuid}</>,
          id: 'uuid',
          optional: true,
          keys: ['uuid'],
          copyField: (row) => row.uuid,
        },
      ]}
      title={translate('Server groups')}
      verboseName={translate('server groups')}
      hasQuery={true}
      hasOptionalColumns
      showPageSizeSelector
    />
  );
};
