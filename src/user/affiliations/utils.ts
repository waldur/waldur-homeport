import {
  callManagingOrganisationsDeleteUser,
  customersDeleteUser,
  marketplaceProviderOfferingsDeleteUser,
  marketplaceResourceProjectsDeleteUser,
  marketplaceResourcesDeleteUser,
  marketplaceServiceProvidersDeleteUser,
  Permission,
  projectsDeleteUser,
  proposalProposalsDeleteUser,
  proposalProtectedCallsDeleteUser,
  User,
} from 'waldur-js-client';

import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { RoleType } from '@/permissions/types';

export const canDeletePermission = (user: User, perm: Permission) => {
  const scopeType = perm.scope_type as RoleType;
  let permission;
  switch (scopeType) {
    case 'project':
      permission = PermissionEnum.DELETE_PROJECT_PERMISSION;
      break;
    case 'customer':
    case 'service_provider':
      permission = PermissionEnum.DELETE_CUSTOMER_PERMISSION;
      break;
    case 'offering':
      permission = PermissionEnum.DELETE_OFFERING_PERMISSION;
      break;
    case 'call':
    case 'call_organizer':
      permission = PermissionEnum.DELETE_CALL_PERMISSION;
      break;
    case 'proposal':
      permission = PermissionEnum.DELETE_PROPOSAL_PERMISSION;
      break;
    case 'resource':
      permission = PermissionEnum.DELETE_RESOURCE_PERMISSION;
      break;
    case 'resource_project':
      permission = PermissionEnum.DELETE_RESOURCE_PROJECT_PERMISSION;
      break;
  }
  return hasPermission(user, {
    permission,
    customerId: scopeType === 'customer' ? perm.scope_uuid : perm.customer_uuid,
  });
};

export const revokePermission = async (perm: Permission) => {
  const scopeType = perm.scope_type as RoleType;
  const body = {
    path: { uuid: perm.scope_uuid },
    body: { user: perm.user_uuid, role: perm.role_name },
  };
  switch (scopeType) {
    case 'project':
      await projectsDeleteUser(body);
      break;
    case 'customer':
      await customersDeleteUser(body);
      break;
    case 'service_provider':
      await marketplaceServiceProvidersDeleteUser(body);
      break;
    case 'offering':
      await marketplaceProviderOfferingsDeleteUser(body);
      break;
    case 'call':
      await proposalProtectedCallsDeleteUser(body);
      break;
    case 'call_organizer':
      await callManagingOrganisationsDeleteUser(body);
      break;
    case 'proposal':
      await proposalProposalsDeleteUser(body);
      break;
    case 'resource':
      await marketplaceResourcesDeleteUser(body as any);
      break;
    case 'resource_project':
      await marketplaceResourceProjectsDeleteUser(body as any);
      break;

    default:
      return;
  }
};
