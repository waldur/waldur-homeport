import { ENV } from '@waldur/configs/default';

import { RoleEnum } from './enums';

const getRoles = (type: string) =>
  ENV.roles
    .filter((role) => role.content_type === type && role.is_active)
    .map((role) => ({ label: role.description, value: role.name }))
    .sort((a, b) => a.label.localeCompare(b.label));

export const getProjectRoles = () => getRoles('project');

export const getCustomerRoles = () => getRoles('customer');

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
  return ENV.roles.find((role) => role.name === roleName).description;
};
export const getCustomerPermission = (user, customer) => {
  if (!user || !user.permissions || !customer) {
    return null;
  }
  return user.permissions?.find(
    (permission) =>
      customer &&
      permission.scope_uuid === customer.uuid &&
      permission.scope_type === 'customer',
  );
};
export const getProjectPermission = (user) =>
  user.permissions?.find(({ scope_type }) => scope_type === 'project');
