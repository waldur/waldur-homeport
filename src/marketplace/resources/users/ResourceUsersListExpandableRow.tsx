import { FunctionComponent } from 'react';

import { formatDateTime } from '@/core/dateUtils';
import { Link } from '@/core/Link';
import { translate } from '@/i18n';
import { ActionsDropdownComponent } from '@/table/ActionsDropdown';
import { ExpandableContainer } from '@/table/ExpandableContainer';
import { RoleField } from '@/user/affiliations/RoleField';

import {
  DeleteUserAction,
  UpdateUserExpirationAction,
} from './TeamUserActions';

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
  grant: ResourceProjectGrant;
  refetch: () => void;
}> = ({ member, grant, refetch }) => {
  const syntheticRow = {
    scope_type: 'resource_project' as const,
    scope_uuid: grant.uuid,
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
  if (!row.resource_projects || row.resource_projects.length === 0) {
    return (
      <div className="text-center py-4">
        <p>{translate('No projects are assigned to this user.')}</p>
      </div>
    );
  }
  return (
    <ExpandableContainer hasMultiSelect>
      <table className="table align-middle gy-0 mb-0">
        <thead className="border-bottom">
          <tr>
            <th className="text-dark">{translate('Project name')}</th>
            <th />
            <th className="text-dark w-25">{translate('Role')}</th>
            <th className="text-dark w-45px">{translate('Expiration time')}</th>
            <th className="header-actions text-dark">{translate('Actions')}</th>
          </tr>
        </thead>
        <tbody>
          {row.resource_projects.map((grant) => (
            <tr key={grant.uuid}>
              <td>
                <Link
                  state="marketplace-resource-details"
                  params={{
                    resource_uuid: resourceUuid,
                    tab: 'resource-projects',
                  }}
                  label={grant.name}
                />
              </td>
              <td />
              <td>
                <RoleField row={grant} />
              </td>
              <td>
                {grant.expiration_time
                  ? formatDateTime(grant.expiration_time)
                  : translate('N/A')}
              </td>
              <td className="row-actions">
                <div>
                  <RowActions member={row} grant={grant} refetch={refetch} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </ExpandableContainer>
  );
};
