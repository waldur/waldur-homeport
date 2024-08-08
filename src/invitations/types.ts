import { RoleType } from '@waldur/permissions/types';

export interface Invitation {
  uuid: string;
  civil_number?: string;
  extra_invitation_text?: string;
  email: string;
  scope_name: string;
  scope_uuid: string;
  scope_type: RoleType;
  state: string;
  execution_state: string;
  error_message?: string;
  role_name: string;
  role_description: string;
  customer_name: string;
  created_by_full_name?: string;
  created_by_username: string;
  expires?: string;
  created?: string;
}
export interface GenericInvitationContext {
  scope?: { url: string; uuid: string };
  roleTypes?: RoleType[];
  roles?: string[];
}
