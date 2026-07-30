import {
  marketplaceResourcesTeamMembersList,
  MarketplaceResourcesTeamMembersListData,
} from 'waldur-js-client';

import { TeamTableComponent } from '@/customer/team/TeamTableComponent';
import { translate } from '@/i18n';
import { createFetcher } from '@/table/api';
import { useTable } from '@/table/useTable';

import { ResourcePermissionsLogButton } from './ResourcePermissionsLogButton';
import { ResourceTeamAddDropdown } from './ResourceTeamAddDropdown';
import { ResourceUsersListExpandableRow } from './ResourceUsersListExpandableRow';

export const ResourceUsersList = ({
  resource,
  offering,
  tableTabs,
  title,
}: any) => {
  const tableProps = useTable({
    table: 'ResourceUsersList',
    // The new team_members endpoint returns one row per user with their
    // direct Resource role and a nested resource_projects[] array of
    // their per-ResourceProject grants — mirroring the org-level
    // customers/{uuid}/users/ shape.
    fetchData: createFetcher(marketplaceResourcesTeamMembersList, {
      path: {
        uuid: resource.uuid,
      } satisfies MarketplaceResourcesTeamMembersListData['path'],
    }),
    queryField: 'search_string',
    // Without explicit mandatory fields the fetcher only requests the
    // fields the visible columns declare via `keys`. The expandable
    // body and the "in N projects" hint both need `resource_projects`,
    // which is not declared by any column.
    mandatoryFields: [
      'uuid',
      'username',
      'full_name',
      'email',
      'image',
      'role_name',
      'role_uuid',
      // All resource-scope grants; the Role column renders one badge
      // per entry so multi-role users are not collapsed to one badge.
      'roles',
      'expiration_time',
      'resource_projects',
    ],
  });

  return (
    <TeamTableComponent
      {...tableProps}
      title={title ?? translate('Team')}
      tabs={tableTabs}
      tableActions={
        <ResourceTeamAddDropdown
          scope="resource"
          scopeUuid={resource.uuid}
          scopeUrl={resource.url}
          scopeLabel={resource.name}
          projectUuid={resource.project_uuid}
          customerUuid={resource.customer_uuid}
          offering={offering}
          refetch={tableProps.fetch}
        />
      }
      dropdownActions={<ResourcePermissionsLogButton scopeUrl={resource.url} />}
      enableExport
      showExportInDropdown
      // Inline hint when the user has no direct Resource role but has
      // grants on sub-projects; surfaced in the otherwise-empty Role
      // column.
      roleSuffix={(row) =>
        !row.role_name && row.resource_projects?.length
          ? translate('in {count} projects', {
              count: row.resource_projects.length,
            })
          : null
      }
      expandableRow={({ row }) => (
        <ResourceUsersListExpandableRow
          row={row}
          resourceUuid={resource.uuid}
          refetch={tableProps.fetch}
        />
      )}
    />
  );
};
