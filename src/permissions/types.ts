import { PermissionMap } from './enums';

export type RoleType = keyof typeof PermissionMap;

export interface Role {
  uuid: string;
  is_active: boolean;
  name: string;
  description: string;
  content_type: RoleType;
  permissions: string[];
}

export interface BasePermission {
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
  scopeId?: string;
}
