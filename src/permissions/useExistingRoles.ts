import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import {
  callManagingOrganisationsListUsersList,
  customersListUsersList,
  marketplaceProviderOfferingsListUsersList,
  marketplaceServiceProvidersListUsersList,
  projectsListUsersList,
  proposalProposalsListUsersList,
  proposalProtectedCallsListUsersList,
  UserRoleDetails,
  userPermissionsList,
} from 'waldur-js-client';

import { UI_STALE_TIME } from '@/core/constants';

import { ExistingRoleHit, mapUserRoleDetails } from './existingRoles';
import { Role } from './types';

type ScopeWithListUsers =
  | 'project'
  | 'customer'
  | 'offering'
  | 'call'
  | 'proposal'
  | 'call_organizer'
  | 'service_provider';

const SCOPES_WITH_LIST_USERS: ScopeWithListUsers[] = [
  'project',
  'customer',
  'offering',
  'call',
  'proposal',
  'call_organizer',
  'service_provider',
];

/**
 * Every grantable scope exposes list_users with the same user filter. The
 * calls are spelled out one by one rather than kept in a lookup table because
 * the generated signatures differ per endpoint and only line up behind a cast.
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
    case 'offering':
      return (
        (
          await marketplaceProviderOfferingsListUsersList({
            path: { uuid },
            query,
          })
        ).data ?? []
      );
    case 'call':
      return (
        (
          await proposalProtectedCallsListUsersList({
            path: { uuid },
            query,
          })
        ).data ?? []
      );
    case 'proposal':
      return (
        (await proposalProposalsListUsersList({ path: { uuid }, query }))
          .data ?? []
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
    case 'global':
      // There is one site scope and no list_users on it: the user's active
      // site-wide grants are the roles held "there". The fields the check
      // reads (role uuid and name, email) are common to both shapes.
      return ((
        await userPermissionsList({
          query: {
            user,
            scope_type: 'global',
            is_active: true,
            page_size: 100,
          },
        })
      ).data ?? []) as unknown as UserRoleDetails[];
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
  const isSiteWide = role?.content_type === 'global';
  const enabled = Boolean(
    role &&
    userUuid &&
    (isSiteWide ||
      (SCOPES_WITH_LIST_USERS.includes(
        role.content_type as ScopeWithListUsers,
      ) &&
        scopeUuid)),
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
