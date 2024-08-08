import { FunctionComponent, useMemo } from 'react';
import { ButtonGroup } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { CreateServerGroupAction } from '@waldur/openstack/openstack-tenant/actions/CreateServerGroupAction';
import { PullServerGroupsAction } from '@waldur/openstack/openstack-tenant/actions/PullServerGroupsAction';
import { ServerGroupType } from '@waldur/openstack/types';
import { ResourceRowActions } from '@waldur/resource/actions/ResourceRowActions';
import { ResourceState } from '@waldur/resource/state/ResourceState';
import { Resource } from '@waldur/resource/types';
import { Table, createFetcher } from '@waldur/table';
import { useTable } from '@waldur/table/utils';

interface ResourceRules extends Resource {
  policy: ServerGroupType;
}

const ResourcePolicy = (resource: ResourceRules) => resource.policy;

export const ServerGroupsList: FunctionComponent<{ resourceScope }> = ({
  resourceScope,
}) => {
  const filter = useMemo(
    () => ({
      tenant_uuid: resourceScope.uuid,
    }),
    [resourceScope],
  );
  const props = useTable({
    table: 'openstack-server-groups',
    fetchData: createFetcher('openstack-server-groups'),
    filter,
  });
  return (
    <Table
      {...props}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => row.name,
          orderField: 'name',
        },
        {
          title: translate('Policy'),
          render: ({ row }) => ResourcePolicy(row),
          orderField: 'policy',
        },
        {
          title: translate('State'),
          render: ({ row }) => <ResourceState resource={row} />,
          className: 'col-sm-2',
        },
        {
          title: translate('Actions'),
          render: ({ row }) => (
            <ResourceRowActions resource={row} refetch={props.fetch} />
          ),
          className: 'col-sm-2',
        },
      ]}
      verboseName={translate('server groups')}
      initialSorting={{ field: 'name', mode: 'asc' }}
      showPageSizeSelector={true}
      tableActions={
        <ButtonGroup>
          <PullServerGroupsAction resource={resourceScope} />
          <CreateServerGroupAction resource={resourceScope} />
        </ButtonGroup>
      }
    />
  );
};
