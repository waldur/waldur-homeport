import { FunctionComponent, useMemo } from 'react';
import {
  rancherClusterSecurityGroupsList,
  RancherClusterSecurityGroupsListData,
  Resource,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { SecurityGroupRulesList } from '@/openstack/openstack-security-groups/SecurityGroupRulesList';
import { ActionsDropdownComponent } from '@/table/ActionsDropdown';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';

import { ClusterSecurityGroupSetRulesButton } from './ClusterSecurityGroupSetRulesButton';
import { SetManagementSecurityGroupButton } from './SetManagementSecurityGroupButton';

const RowActions = ({ row, fetch }) => (
  <ActionsDropdownComponent>
    <ClusterSecurityGroupSetRulesButton resource={row} refetch={fetch} />
  </ActionsDropdownComponent>
);

export const ClusterSecurityGroupsList: FunctionComponent<{
  resourceScope: Resource;
}> = ({ resourceScope }) => {
  const columns = [
    {
      title: translate('Name'),
      render: ({ row }) => row.name,
    },
  ];

  const filter = useMemo(
    () =>
      ({
        // ManagedRancher marketplace resource scope is a Rancher marketplace resource
        // and not a Rancher cluster directly because of uniqueness constraint.
        // We need to use resource_uuid from the scope to filter security groups.
        cluster_uuid: resourceScope.resource_uuid || resourceScope.uuid,
      }) satisfies RancherClusterSecurityGroupsListData['query'],
    [resourceScope],
  );
  const tableProps = useTable({
    table: 'ClusterSecurityGroups',
    fetchData: createFetcher(rancherClusterSecurityGroupsList),
    filter,
  });

  return (
    <Table
      {...tableProps}
      title={translate('Security groups')}
      columns={columns}
      verboseName={translate('security groups')}
      expandableRow={SecurityGroupRulesList}
      rowActions={RowActions}
      tableActions={
        resourceScope.resource_uuid ? (
          <SetManagementSecurityGroupButton
            clusterId={resourceScope.resource_uuid}
          />
        ) : null
      }
    />
  );
};
