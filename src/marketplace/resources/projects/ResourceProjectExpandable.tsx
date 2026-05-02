import { FC, useMemo, useState } from 'react';
import {
  ResourceProject,
  marketplaceResourceProjectsListUsersList,
  MarketplaceResourceProjectsListUsersListData,
} from 'waldur-js-client';

import { ENV } from '@/core/config';
import { TeamTableComponent } from '@/customer/team/TeamTableComponent';
import { translate } from '@/i18n';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { ActionsDropdown } from '@/table/ActionsDropdown';
import { createFetcher } from '@/table/api';
import { TableTab } from '@/table/types';
import { useTable } from '@/table/useTable';
import { useUser } from '@/workspace/hooks';

import { ResourcePermissionsLogButton } from '../users/ResourcePermissionsLogButton';
import { ResourceTeamAddDropdown } from '../users/ResourceTeamAddDropdown';
import {
  DeleteUserAction,
  UpdateUserExpirationAction,
} from '../users/TeamUserActions';

import { ResourceUserInvitationsList } from './ResourceUserInvitationsList';

const buildResourceProjectUrl = (uuid: string) => {
  const base = (ENV.apiEndpoint || '').replace(/\/$/, '');
  return `${base}/api/marketplace-resource-projects/${uuid}/`;
};

interface ResourceProjectExpandableProps {
  row: ResourceProject;
  resource?;
  offering?;
}

export const ResourceProjectExpandable: FC<ResourceProjectExpandableProps> = ({
  row: project,
  resource,
  offering,
}) => {
  const tableProps = useTable({
    table: `resource-project-users-${project.uuid}`,
    fetchData: createFetcher(marketplaceResourceProjectsListUsersList, {
      path: {
        uuid: project.uuid,
      } satisfies MarketplaceResourceProjectsListUsersListData['path'],
    }),
    queryField: 'search_string',
  });

  const user = useUser();
  const canManage = hasPermission(user, {
    permission: PermissionEnum.CREATE_RESOURCE_PROJECT_PERMISSION,
    projectId: resource?.project_uuid,
    customerId: resource?.customer_uuid,
  });
  const projectScopeUrl = buildResourceProjectUrl(project.uuid);

  // Each expanded row owns its own sub-tab state — a URL-driven approach
  // would force every expanded row to share the same active sub-tab.
  const [subTab, setSubTab] = useState<'active' | 'invitations'>('active');

  // Real TableTabs that render inside the card (matching the resource
  // Team tab layout). The local-state mode (onSelect + active) bypasses
  // ui-router so each expanded row stays independent.
  const tableTabs = useMemo<TableTab[]>(
    () => [
      {
        key: 'active',
        title: translate('Active'),
        active: subTab === 'active',
        onSelect: () => setSubTab('active'),
      },
      {
        key: 'invitations',
        title: translate('Invitations'),
        active: subTab === 'invitations',
        onSelect: () => setSubTab('invitations'),
      },
    ],
    [subTab],
  );

  return (
    <div className="p-3">
      {subTab === 'invitations' ? (
        <ResourceUserInvitationsList
          resource={resource}
          offering={offering}
          scopeUuid={project.uuid}
          scopeUrl={projectScopeUrl}
          scopeLabel={project.name}
          contentType="resource_project"
          title={translate('Team')}
          tableTabs={tableTabs}
        />
      ) : (
        <TeamTableComponent
          {...tableProps}
          context="resource_project"
          userFieldPrefix="user_"
          title={translate('Team')}
          tabs={tableTabs}
          tableActions={
            resource ? (
              <ResourceTeamAddDropdown
                scope="resource_project"
                scopeUuid={project.uuid}
                scopeUrl={projectScopeUrl}
                scopeLabel={project.name}
                projectUuid={resource.project_uuid}
                customerUuid={resource.customer_uuid}
                offering={offering}
                refetch={tableProps.fetch}
              />
            ) : null
          }
          dropdownActions={
            <ResourcePermissionsLogButton scopeUrl={projectScopeUrl} />
          }
          enableExport
          showExportInDropdown
          rowActions={({ row }) =>
            canManage ? (
              <ActionsDropdown row={row} refetch={tableProps.fetch}>
                <UpdateUserExpirationAction
                  row={row}
                  refetch={tableProps.fetch}
                />
                <DeleteUserAction row={row} refetch={tableProps.fetch} />
              </ActionsDropdown>
            ) : null
          }
        />
      )}
    </div>
  );
};
