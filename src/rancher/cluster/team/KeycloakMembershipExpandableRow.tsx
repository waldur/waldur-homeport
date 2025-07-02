import { FC, useMemo } from 'react';
import { KeycloakUserGroupMembership, RancherCluster } from 'waldur-js-client';

import { Badge } from '@waldur/core/Badge';
import { translate } from '@waldur/i18n';
import { createFetcher } from '@waldur/table/api';
import { ExpandableContainer } from '@waldur/table/ExpandableContainer';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';

import { KeycloakMembershipRowActions } from './KeycloakMembershipRowActions';
import { getKeycloakMembershipRoleColor } from './utils';

export const KeycloakMembershipExpandableRow: FC<{
  row: KeycloakUserGroupMembership;
  resource: RancherCluster;
}> = ({ row, resource }) => {
  const filter = useMemo(
    () => ({
      cluster_uuid: resource.uuid,
      scope_type: 'project',
      username: row.username,
    }),
    [resource, row],
  );
  const props = useTable({
    table: 'rancher-keycloak-memberships-' + row.uuid,
    fetchData: createFetcher('keycloak-user-group-memberships'),
    filter,
  });

  return (
    <ExpandableContainer hasMultiSelect>
      <Table<KeycloakUserGroupMembership>
        {...props}
        columns={[
          {
            title: translate('Project name'),
            render: ({ row }) => <>{row.group_scope_name || 'N/A'}</>,
          },
          {
            title: translate('Role'),
            render: ({ row }) => (
              <Badge
                variant={getKeycloakMembershipRoleColor(row.group_role)}
                outline
                pill
              >
                {row.group_role}
              </Badge>
            ),

            export: 'group_role',
          },
          {
            title: translate('Status'),
            render: ({ row }) =>
              row.state === 'active' ? (
                <Badge variant="success" outline pill>
                  {translate('Active')}
                </Badge>
              ) : (
                <Badge variant="warning" outline pill>
                  {translate('Pending')}
                </Badge>
              ),

            export: 'state',
          },
        ]}
        verboseName={translate('Keycloak user group membership')}
        rowActions={KeycloakMembershipRowActions}
        hasActionBar={false}
        fullWidth
      />
    </ExpandableContainer>
  );
};
