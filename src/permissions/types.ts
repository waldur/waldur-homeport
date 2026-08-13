import { PermissionMap } from './enums';

export type RoleType = keyof typeof PermissionMap;

export { RoleDetails as Role } from 'waldur-js-client';

interface BasePermission {
  customer_uuid: string;
  customer_name: string;
  scope_type: RoleType;
  scope_uuid: string;
  scope_name: string;
  role_name: string;
  role_description: string;
  role_uuid: string;
  created_by_full_name: string;
  created_by_username: string;
  created: string;
  expiration_time: string;
}

export interface GenericPermission extends BasePermission {
  user_image: string;
  user_username: string;
  user_email: string;
  user_uuid: string;
  user_full_name: string;
  customer_uuid: string;
  customer_name: string;
  scope_type: RoleType;
  scope_uuid: string;
  scope_name: string;
  role_name: string;
  role_description: string;
  role_uuid: string;
  created_by_full_name: string;
  created_by_username: string;
  created: string;
  expiration_time: string;
}

export interface PermissionRequest {
  permission: string;
  projectId?: string;
  customerId?: string;
  callOrganizerId?: string;
  /**
   * Offering uuid, for permissions held directly on an offering (OFFERING.MANAGER
   * and its org-private clones). Kept separate from `scopeId` because the latter
   * is resolved against the call/proposal content types.
   */
  offeringId?: string;
  scopeId?: string;
}
