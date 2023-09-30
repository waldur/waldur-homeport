export interface Role {
  is_active: boolean;
  name: string;
  description: string;
  content_type: string;
  permissions: string[];
}

export interface GenericPermission {
  user_image: string;
  user_username: string;
  user_email: string;
  user_full_name: string;
  customer_uuid: string;
  customer_name: string;
  scope_type: string;
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
  offeringId?: string;
}
