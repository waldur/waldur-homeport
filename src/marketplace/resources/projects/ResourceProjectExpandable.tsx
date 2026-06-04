import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { Nav, Tab } from 'react-bootstrap';
import {
  ResourceProject,
  marketplaceResourceProjectsListUsersList,
  MarketplaceResourceProjectsListUsersListData,
  userInvitationsCount,
  UserInvitationsCountData,
} from 'waldur-js-client';

import { fetchResultCount, fixURL } from '@/core/api';
import Avatar from '@/core/Avatar';
import { TableTabsContainer } from '@/customer/list/TableTabsContainer';
import { renderRoleExpirationDate } from '@/customer/team/TeamTableComponent';
import { isFeatureVisible } from '@/features/connect';
import { UserFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import {
  ActionsDropdown,
  ActionsDropdownComponent,
} from '@/table/ActionsDropdown';
import { createFetcher } from '@/table/api';
import { DASH_ESCAPE_CODE } from '@/table/constants';
import { ExpandableContainer } from '@/table/ExpandableContainer';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { NavItem } from '@/user/affiliations/OrganizationExpandableRow';
import { RoleField } from '@/user/affiliations/RoleField';
import { useUser } from '@/workspace/hooks';

import { DeleteUserAction } from '../users/DeleteUserAction';
import { ResourcePermissionsLogButton } from '../users/ResourcePermissionsLogButton';
import { ResourceTeamAddDropdown } from '../users/ResourceTeamAddDropdown';
import { UpdateUserExpirationAction } from '../users/UpdateUserExpirationAction';

import { ResourceUserInvitationsList } from './ResourceUserInvitationsList';

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
  const user = useUser();
  const canManage = hasPermission(user, {
    permission: PermissionEnum.CREATE_RESOURCE_PROJECT_PERMISSION,
    projectId: resource?.project_uuid,
    customerId: resource?.customer_uuid,
  });
  const projectScopeUrl = fixURL(
    `/marketplace-resource-projects/${project.uuid}/`,
  );

  const tableProps = useTable({
    table: `resource-project-users-${project.uuid}`,
    fetchData: createFetcher(marketplaceResourceProjectsListUsersList, {
      path: {
        uuid: project.uuid,
      } satisfies MarketplaceResourceProjectsListUsersListData['path'],
    }),
  });

  // The Invitations table is lazy-mounted (unmountOnExit), so its row count is
  // unavailable until the tab is opened. Fetch the count separately to keep the
  // tab badge correct up-front.
  const invitationsCount = useQuery({
    queryKey: ['resource-project-invitations-count', project.uuid],
    queryFn: () =>
      userInvitationsCount({
        query: {
          scope: projectScopeUrl,
        } satisfies UserInvitationsCountData['query'],
      }).then(fetchResultCount),
  });

  return (
    <ExpandableContainer className="border rounded">
      <TableTabsContainer
        defaultActiveKey="active"
        unmountOnExit={true}
        className="with-header"
      >
        <div className="d-flex align-items-center justify-content-between gap-4 px-4 py-3 border-bottom">
          <span className="fs-5 fw-bold text-gray-900">
            {translate('Team')}
          </span>
          <div className="d-flex align-items-center gap-2">
            <ActionsDropdownComponent
              labeled
              size="sm"
              variant="tertiary"
              label={translate('Actions')}
            >
              <ResourcePermissionsLogButton scopeUrl={projectScopeUrl} />
            </ActionsDropdownComponent>
            {canManage && resource ? (
              <ResourceTeamAddDropdown
                scope="resource_project"
                scopeUuid={project.uuid}
                scopeUrl={projectScopeUrl}
                scopeLabel={project.name}
                projectUuid={resource.project_uuid}
                customerUuid={resource.customer_uuid}
                offering={offering}
                size="sm"
                refetch={tableProps.fetch}
              />
            ) : null}
          </div>
        </div>
        <div className="overflow-auto">
          <Nav variant="tabs" className="nav-line-tabs flex-nowrap">
            <NavItem
              title={translate('Active')}
              eventKey="active"
              count={tableProps.pagination.resultCount}
              countLoading={tableProps.loading}
            />
            <NavItem
              title={translate('Invitations')}
              eventKey="invitations"
              count={invitationsCount.data}
              countLoading={invitationsCount.isLoading}
            />
          </Nav>
        </div>
        <Tab.Content className="overflow-auto">
          <Tab.Pane eventKey="active" unmountOnExit={true}>
            <Table
              {...tableProps}
              columns={[
                {
                  title: translate('Member'),
                  render: ({ row }) => (
                    <div className="content-wrapper gap-2">
                      <Avatar
                        src={row.user_image}
                        name={row.user_full_name}
                        circle
                      />
                      <p className="mb-0">
                        {row.user_full_name || DASH_ESCAPE_CODE}
                      </p>
                    </div>
                  ),
                  copyField: (row) => row.user_full_name,
                },
                isFeatureVisible(UserFeatures.show_username) && {
                  title: translate('Username'),
                  render: ({ row }) => row.user_username,
                  copyField: (row) => row.user_username,
                  className: 'w-25',
                },
                {
                  title: translate('Email'),
                  render: ({ row }) => row.user_email || DASH_ESCAPE_CODE,
                  copyField: (row) => row.user_email,
                },
                {
                  title: translate('Role in project'),
                  render: RoleField,
                  className: 'w-25',
                },
                {
                  title: translate('Role expiration'),
                  render: ({ row }) => renderRoleExpirationDate(row),
                  className: 'w-45px',
                },
              ].filter(Boolean)}
              verboseName={translate('team members')}
              hasActionBar={false}
              hoverShadow={false}
              cardBordered={false}
              initialPageSize={5}
              minHeight="auto"
              rowActions={({ row }) => {
                if (!canManage) return null;
                const actionRow = {
                  ...row,
                  scope_type: 'resource_project' as const,
                  scope_uuid: project.uuid,
                };
                return (
                  <ActionsDropdown
                    row={actionRow}
                    refetch={tableProps.fetch}
                    size="sm"
                  >
                    <UpdateUserExpirationAction
                      row={actionRow}
                      refetch={tableProps.fetch}
                    />
                    <DeleteUserAction
                      row={actionRow}
                      refetch={tableProps.fetch}
                    />
                  </ActionsDropdown>
                );
              }}
            />
          </Tab.Pane>
          <Tab.Pane eventKey="invitations" unmountOnExit={true}>
            <ResourceUserInvitationsList
              resource={resource}
              offering={offering}
              scopeUuid={project.uuid}
              scopeUrl={projectScopeUrl}
              scopeLabel={project.name}
              contentType="resource_project"
              hasActionBar={false}
            />
          </Tab.Pane>
        </Tab.Content>
      </TableTabsContainer>
    </ExpandableContainer>
  );
};
