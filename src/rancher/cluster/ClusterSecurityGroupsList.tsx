import { FunctionComponent, useMemo } from 'react';
import {
  RancherClusterSecurityGroupsListData,
  Resource,
} from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { SecurityGroupRulesList } from '@waldur/openstack/openstack-security-groups/SecurityGroupRulesList';
import { ActionsDropdownComponent } from '@waldur/table/ActionsDropdown';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';

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
        cluster_uuid: resourceScope.resource_uuid,
      }) satisfies RancherClusterSecurityGroupsListData['query'],
    [resourceScope],
  );
  const tableProps = useTable({
    table: 'ClusterSecurityGroups',
    fetchData: createFetcher('rancher-cluster-security-groups'),
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
        <SetManagementSecurityGroupButton
          clusterId={resourceScope.resource_uuid}
        />
      }
    />
  );
};
