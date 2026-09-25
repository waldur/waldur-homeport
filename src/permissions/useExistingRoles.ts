import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import {
  callManagingOrganisationsListUsersList,
  customersListUsersList,
  marketplaceServiceProvidersListUsersList,
  projectsListUsersList,
  UserRoleDetails,
} from 'waldur-js-client';

import { UI_STALE_TIME } from '@/core/constants';

import { ExistingRoleHit, mapUserRoleDetails } from './existingRoles';
import { Role } from './types';

type ScopeWithListUsers =
  'project' | 'customer' | 'call_organizer' | 'service_provider';

const SCOPES_WITH_LIST_USERS: ScopeWithListUsers[] = [
  'project',
  'customer',
  'call_organizer',
  'service_provider',
];

/**
 * Every scope an add-user dialog can target exposes the same list_users action,
 * mirroring the four-way branch in AddUserDialog's saveUser. The calls are
 * spelled out one by one rather than kept in a lookup table because the
 * generated signatures differ per endpoint and only line up behind a cast.
 */
const listScopeUsers = async (
  contentType: Role['content_type'],
  uuid: string,
  user: string,
): Promise<UserRoleDetails[]> => {
  const query = { user, page_size: 100 };
  switch (contentType) {
    case 'project':
      return (
        (await projectsListUsersList({ path: { uuid }, query })).data ?? []
      );
    case 'customer':
      return (
        (await customersListUsersList({ path: { uuid }, query })).data ?? []
      );
    case 'call_organizer':
      return (
        (
          await callManagingOrganisationsListUsersList({
            path: { uuid },
            query,
          })
        ).data ?? []
      );
    case 'service_provider':
      return (
        (
          await marketplaceServiceProvidersListUsersList({
            path: { uuid },
            query,
          })
        ).data ?? []
      );
    default:
      return [];
  }
};

interface ExistingRolesParams {
  role?: Role | null;
  userUuid?: string;
  scopeUuid?: string;
}

/**
 * Active roles the selected user already holds in the scope the role would be
 * granted in. Stays idle while any of the inputs is still missing.
 *
 * What list_users returns does not depend on the role being requested, so the
 * query is keyed on the scope and user alone and the comparison against the
 * requested role happens outside it. Keying the query on the role instead would
 * refetch the same rows on every role change, and baking the role into the
 * cached value would serve a stale verdict when the key did not change.
 */
export const useExistingRoles = ({
  role,
  userUuid,
  scopeUuid,
}: ExistingRolesParams) => {
  const enabled = Boolean(
    role &&
    SCOPES_WITH_LIST_USERS.includes(role.content_type as ScopeWithListUsers) &&
    scopeUuid &&
    userUuid,
  );

  const { data, isPending } = useQuery<UserRoleDetails[]>({
    queryKey: ['existing-roles', role?.content_type, scopeUuid, userUuid],
    queryFn: () => listScopeUsers(role.content_type, scopeUuid, userUuid),
    enabled,
    staleTime: UI_STALE_TIME,
  });

  const hits: ExistingRoleHit[] = useMemo(
    () => (role ? mapUserRoleDetails(data, role.uuid) : []),
    [data, role?.uuid],
  );

  return { hits, isChecking: enabled && isPending };
};
