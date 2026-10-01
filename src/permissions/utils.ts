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

/**
 * Map role name to its human-readable label, for rendering a stored list of
 * role names (which is what the role-valued offering options hold) without
 * looking each one up again.
 */
export const getRoleLabels = (roles: Role[]): Record<string, string> =>
  Object.fromEntries(
    roles.map((role) => [role.name, role.description || role.name]),
  );

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

/**
 * The role a member currently holds, for pre-filling an edit form. Searches the
 * whole cache rather than getRoles, and falls back to a role built from the
 * name: a deactivated role, or an organization clone created after page load,
 * is still the member's role, and the backend accepts updating its expiration.
 * Pass the description when the permission carries one, so an uncached role
 * reads as a label rather than a machine name.
 */
export const getHeldRole = (
  roleName: string | null | undefined,
  contentType: RoleType,
  description?: string,
): Role | undefined =>
  roleName
    ? (ENV.roles.find(
        (role) => role.name === roleName && role.content_type === contentType,
      ) ??
      ({
        name: roleName,
        description: description || roleName,
        content_type: contentType,
      } as Role))
    : undefined;

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

type LabelledRole = Pick<Role, 'name' | 'description'> &
  Partial<
    Pick<Role, 'uuid' | 'content_type' | 'is_system_role' | 'customer_name'>
  >;

// Names are unique only within a scope type, so key by uuid when there is one;
// a held role rebuilt from a permission (getHeldRole) has only its name.
const getRoleKey = (role: Pick<LabelledRole, 'uuid' | 'name'>) =>
  role.uuid ?? role.name;

/**
 * Short qualifiers telling apart roles that share a display name within one
 * list, keyed by role uuid (or name, without one). Only colliding roles get one:
 * the scope type when the collision spans scopes, and the owning organization
 * (or "Custom role") for a non-system role such as an organization's copy of a
 * system role. The machine name is the last resort, used only when those still
 * leave two roles alike.
 * Pass the result to formatRoleLabel.
 */
export const getRoleQualifiers = (
  roles: LabelledRole[],
): Map<string, string> => {
  const groups = new Map<string, LabelledRole[]>();
  for (const role of roles) {
    const label = role.description || role.name;
    groups.set(label, [...(groups.get(label) ?? []), role]);
  }
  const qualifiers = new Map<string, string>();
  for (const [label, group] of groups) {
    if (group.length < 2) continue;
    // A role of unknown scope (a held role rebuilt from a rule) tells nothing
    // apart, so it must not make the collision look like it spans scopes.
    const spansScopes =
      new Set(group.map((role) => role.content_type).filter(Boolean)).size > 1;
    const candidates = group.map((role) =>
      [
        spansScopes && role.content_type && formatRoleType(role.content_type),
        role.is_system_role === false &&
          (role.customer_name || translate('Custom role')),
      ]
        .filter(Boolean)
        .join(', '),
    );
    group.forEach((role, index) => {
      const clashes = candidates.some(
        (candidate, other) =>
          other !== index && candidate === candidates[index],
      );
      const qualifier = [
        candidates[index],
        clashes && role.name !== label && role.name,
      ]
        .filter(Boolean)
        .join(', ');
      if (qualifier) {
        qualifiers.set(getRoleKey(role), qualifier);
      }
    });
  }
  return qualifiers;
};

/** The qualifier getRoleQualifiers assigned to this role, if any. */
export const getRoleQualifier = (
  role: Pick<LabelledRole, 'uuid' | 'name'>,
  qualifiers?: Map<string, string>,
) => qualifiers?.get(getRoleKey(role));

/**
 * Dropdown label for a role: the human description, followed by its qualifier
 * from getRoleQualifiers when another role in the same list reads the same.
 */
export const formatRoleLabel = (
  role: Pick<LabelledRole, 'uuid' | 'name' | 'description'>,
  qualifiers?: Map<string, string>,
) => {
  const label = role.description || role.name;
  const qualifier = getRoleQualifier(role, qualifiers);
  return qualifier ? `${label} (${qualifier})` : label;
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
