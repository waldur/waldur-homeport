import { User, rolesList } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { createLoadOptions } from '@/form/select';
import { translate } from '@/i18n';
import { ROLE_TYPES } from '@/permissions/constants';

import { PermissionMap, RoleEnum } from './enums';
import { hasPermission } from './hasPermission';
import { PermissionRequest, Role, RoleType } from './types';

export const roleAutocomplete = createLoadOptions(rolesList, 'name', {
  field: ['uuid', 'name', 'description'],
});

/** Narrow an arbitrary role array to the active roles of the given types. */
export const filterRolesByType = (roles: Role[], types: RoleType[]) =>
  roles
    .filter((role) => types.includes(role.content_type) && role.is_active)
    .sort((a, b) => a.content_type.localeCompare(b.content_type));

export const getRoles = (types: RoleType[]) =>
  filterRolesByType(ENV.roles, types);

type GrantScope = Pick<
  PermissionRequest,
  'customerId' | 'projectId' | 'callOrganizerId' | 'scopeId'
>;

/**
 * Keep only roles the acting user may actually grant in the given scope, based
 * on the create-permission required for each role's scope (PermissionMap).
 * Works on any role array so it can be applied to organization-scoped role
 * lists as well as the global one.
 */
export const filterGrantableRoles = (
  roles: Role[],
  user: Pick<User, 'is_staff' | 'permissions'>,
  scope: GrantScope,
): Role[] =>
  roles.filter((role) => {
    const permission = PermissionMap[role.content_type];
    // No known grant-permission for this scope type — don't hide it; the
    // backend remains the authority.
    if (!permission) return true;
    return hasPermission(user, { permission, ...scope });
  });

/**
 * Roles of the given types that the acting user may actually grant. Prevents
 * offering a role the backend would then 403 on (e.g. an owner being shown
 * "Call organizer" but denied the grant).
 */
export const getGrantableRoles = (
  types: RoleType[],
  user: Pick<User, 'is_staff' | 'permissions'>,
  scope: GrantScope,
): Role[] => filterGrantableRoles(getRoles(types), user, scope);

export const getProjectRoles = () => getRoles(['project']);

export const getCustomerRoles = () => getRoles(['customer']);

export const getProposalRoles = () => getRoles(['proposal']);

const ROLE_MAP = {
  owner: RoleEnum.CUSTOMER_OWNER,
  service_manager: RoleEnum.CUSTOMER_MANAGER,
  manager: RoleEnum.PROJECT_MANAGER,
  admin: RoleEnum.PROJECT_ADMIN,
  member: RoleEnum.PROJECT_MEMBER,
  // these are used in event context
  Owner: RoleEnum.CUSTOMER_OWNER,
  Manager: RoleEnum.PROJECT_MANAGER,
  Administrator: RoleEnum.PROJECT_ADMIN,
  Member: RoleEnum.PROJECT_MEMBER,
};

export const formatRole = (name: string) => {
  const roleName = ROLE_MAP[name] || name;
  const role = ENV.roles.find((role) => role.name === roleName);
  return role?.description || role?.name;
};

export const formatRoleType = (content_type: RoleType) =>
  ROLE_TYPES.find(({ value }) => value === content_type)?.label || content_type;

/**
 * Descriptions that appear on more than one role within a list. When two roles
 * share a description (a system role and its organization clone both read
 * "Organization owner"), the machine name has to be shown to tell them apart;
 * everywhere else it is noise. Pass the result to formatRoleLabel.
 */
export const getAmbiguousRoleDescriptions = (
  roles: Pick<Role, 'name' | 'description'>[],
): Set<string> => {
  const seen = new Set<string>();
  const ambiguous = new Set<string>();
  for (const role of roles) {
    const label = role.description || role.name;
    if (seen.has(label)) {
      ambiguous.add(label);
    }
    seen.add(label);
  }
  return ambiguous;
};

/**
 * Dropdown label for a role: normally just the human description. The machine
 * name is appended in parentheses only when `ambiguousDescriptions` (from
 * getAmbiguousRoleDescriptions) says another role in the same list shares that
 * description, so identically-named roles stay distinguishable without adding
 * the machine name to every row. Falls back to the name when there is no
 * description or it already equals the name. Omitting `ambiguousDescriptions`
 * keeps the legacy always-append behaviour.
 */
export const formatRoleLabel = (
  role: Pick<Role, 'name' | 'description'>,
  ambiguousDescriptions?: Set<string>,
) => {
  if (!role.description || role.description === role.name) {
    return role.name;
  }
  if (ambiguousDescriptions && !ambiguousDescriptions.has(role.description)) {
    return role.description;
  }
  return `${role.description} (${role.name})`;
};

/**
 * Returns a descriptive tooltip for disabled permission-gated actions.
 * Looks up ENV.roles to find which roles have the required permission.
 */
export const getPermissionDisabledTooltip = (
  permission: string | string[],
  scopeTypes: RoleType[] = ['project', 'customer'],
): string => {
  const permissions = Array.isArray(permission) ? permission : [permission];
  const roles = ENV.roles
    .filter(
      (role) =>
        scopeTypes.includes(role.content_type as RoleType) &&
        role.is_active &&
        role.permissions?.some((p) => permissions.includes(p)),
    )
    .map((role) => role.description || role.name);

  if (roles.length > 0) {
    return translate('This action is available for: {roles}.', {
      roles: roles.join(', '),
    });
  }
  return translate(
    "You don't have enough privileges to perform this operation.",
  );
};
