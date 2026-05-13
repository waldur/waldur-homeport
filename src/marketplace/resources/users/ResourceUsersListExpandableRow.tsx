import { FunctionComponent, useEffect } from 'react';

import { formatDateTime } from '@/core/dateUtils';
import { Link } from '@/core/Link';
import { translate } from '@/i18n';
import { ActionsDropdownComponent } from '@/table/ActionsDropdown';
import { ExpandableContainer } from '@/table/ExpandableContainer';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';
import { RoleField } from '@/user/affiliations/RoleField';

import { DeleteUserAction } from './DeleteUserAction';
import { UpdateUserExpirationAction } from './UpdateUserExpirationAction';

interface ResourceProjectGrant {
  uuid: string;
  url: string;
  name: string;
  role_name: string;
  role_uuid: string;
  expiration_time: string | null;
}

interface ResourceTeamMember {
  uuid: string;
  full_name: string;
  username: string;
  role_name: string | null;
  resource_projects: ResourceProjectGrant[];
}

/**
 * Expandable row body for the resource Team Active sub-tab. Mirrors
 * `CustomerUsersListExpandableRow` but lists per-ResourceProject grants
 * instead of per-Project grants.
 *
 * Each grant gets Edit (update expiration) and Delete (revoke) actions.
 * Both actions consume `row.scope_*` / `row.user_*` fields from
 * `TeamUserActions.tsx`, so we pass synthetic UserRole-shaped rows
 * built from `(member, grant)` pairs — no changes to the actions
 * themselves are required.
 */
const RowActions: FunctionComponent<{
  member: ResourceTeamMember;
  // grant.uuid is the synthetic composite key; grant.rp_uuid is the
  // real RP uuid that the action API calls need.
  grant: ResourceProjectGrant & { rp_uuid?: string };
  refetch: () => void;
}> = ({ member, grant, refetch }) => {
  const syntheticRow = {
    scope_type: 'resource_project' as const,
    scope_uuid: grant.rp_uuid ?? grant.uuid,
    scope_url: grant.url,
    scope_name: grant.name,
    role_name: grant.role_name,
    role_uuid: grant.role_uuid,
    user_uuid: member.uuid,
    user_full_name: member.full_name,
    user_username: member.username,
    expiration_time: grant.expiration_time,
  } as any;
  return (
    <ActionsDropdownComponent>
      <UpdateUserExpirationAction row={syntheticRow} refetch={refetch} />
      <DeleteUserAction row={syntheticRow} refetch={refetch} />
    </ActionsDropdownComponent>
  );
};

export const ResourceUsersListExpandableRow: FunctionComponent<{
  row: ResourceTeamMember;
  resourceUuid: string;
  refetch: () => void;
}> = ({ row, resourceUuid, refetch }) => {
  // Composite uuid (rp_uuid + role_uuid) survives the table's
  // entity-dict de-dup in `transformRows` (src/table/utils.tsx);
  // without it, two grants on the same RP with different roles
  // collapse to one row. Original RP uuid preserved as `rp_uuid` for
  // the action handlers (need the real id for the API call).
  const tableProps = useTable<
    ResourceProjectGrant & { uuid: string; rp_uuid: string }
  >({
    table: 'ResourceUsersListExpandableRow-' + row.uuid,
    fetchData: () =>
      Promise.resolve({
        rows: (row.resource_projects ?? []).map((g) => ({
          ...g,
          rp_uuid: g.uuid,
          uuid: `${g.uuid}-${g.role_uuid}`,
        })),
      }),
  });

  useEffect(() => {
    tableProps.fetch();
  }, [row.resource_projects]);

  if (!row.resource_projects || row.resource_projects.length === 0) {
    return (
      <div className="text-center py-4">
        <p>{translate('No projects are assigned to this user.')}</p>
      </div>
    );
  }
  return (
    <ExpandableContainer hasMultiSelect>
      <Table<ResourceProjectGrant & { uuid: string; rp_uuid: string }>
        {...tableProps}
        columns={[
          {
            title: translate('Project name'),
            render: ({ row: grant }) => (
              <Link
                state="marketplace-resource-details"
                params={{
                  resource_uuid: resourceUuid,
                  tab: 'resource-projects',
                }}
                label={grant.name}
              />
            ),
          },
          {
            title: translate('Role'),
            render: ({ row: grant }) => <RoleField row={grant} />,
          },
          {
            title: translate('Expiration time'),
            render: ({ row: grant }) =>
              grant.expiration_time
                ? formatDateTime(grant.expiration_time)
                : renderFieldOrDash(null),
          },
        ]}
        rowActions={({ row: grant }) => (
          <RowActions member={row} grant={grant} refetch={refetch} />
        )}
        verboseName={translate('Project grants')}
        hasActionBar={false}
        minHeight="auto"
      />
    </ExpandableContainer>
  );
};
