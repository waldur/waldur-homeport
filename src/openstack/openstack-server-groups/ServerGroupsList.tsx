import { FunctionComponent, useMemo } from 'react';
import { ButtonGroup } from 'react-bootstrap';
import {
  OpenStackServerGroup,
  openstackServerGroupsList,
  OpenstackServerGroupsListData,
} from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { ServerGroupExpandableRow } from '@waldur/openstack/openstack-server-groups/ServerGroupExpandableRow';
import { CreateServerGroupAction } from '@waldur/openstack/openstack-tenant/actions/CreateServerGroupAction';
import { PullServerGroupsAction } from '@waldur/openstack/openstack-tenant/actions/PullServerGroupsAction';
import { ResourceRowActions } from '@waldur/resource/actions/ResourceRowActions';
import { ResourceState } from '@waldur/resource/state/ResourceState';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';

export const ServerGroupsList: FunctionComponent<{ resourceScope }> = ({
  resourceScope,
}) => {
  const filter = useMemo(
    (): OpenstackServerGroupsListData['query'] => ({
      tenant_uuid: resourceScope.uuid,
    }),
    [resourceScope],
  );
  const props = useTable({
    table: 'openstack-server-groups',
    fetchData: createFetcher(openstackServerGroupsList),
    filter,
  });
  return (
    <Table<OpenStackServerGroup>
      {...props}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => row.name,
          copyField: (row) => row.name,
          orderField: 'name',
        },
        {
          title: translate('Policy'),
          render: ({ row }) => row.policy,
          copyField: null,
          orderField: 'policy',
        },
        {
          title: translate('State'),
          render: ({ row }) => <ResourceState resource={row} />,
          className: 'col-sm-2',
        },
      ]}
      rowActions={({ row }) => (
        <ResourceRowActions resource={row} refetch={props.fetch} />
      )}
      expandableRow={ServerGroupExpandableRow}
      title={translate('Server groups')}
      verboseName={translate('server groups')}
      initialSorting={{ field: 'name', mode: 'asc' }}
      showPageSizeSelector={true}
      tableActions={
        <ButtonGroup>
          <PullServerGroupsAction
            resource={resourceScope}
            refetch={props.fetch}
          />

          <CreateServerGroupAction
            resource={resourceScope}
            refetch={props.fetch}
          />
        </ButtonGroup>
      }
    />
  );
};
