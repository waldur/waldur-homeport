import { rolesList } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { createLoadOptions } from '@/form/select';
import { translate } from '@/i18n';
import { ROLE_TYPES } from '@/permissions/constants';

import { RoleEnum } from './enums';
import { RoleType } from './types';

export const roleAutocomplete = createLoadOptions(rolesList, 'name', {
  field: ['uuid', 'name', 'description'],
});

export const getRoles = (types: RoleType[]) =>
  ENV.roles
    .filter((role) => types.includes(role.content_type) && role.is_active)
    .sort((a, b) => a.content_type.localeCompare(b.content_type));

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
