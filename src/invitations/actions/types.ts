import { Role } from '@waldur/permissions/types';
import { Customer, Project, User } from '@waldur/workspace/types';

import { GenericInvitationContext } from '../types';

export interface UserDetails {
  full_name: string;
  native_name: string;
  organization: string;
  job_title: string;
}

export interface StoredUserDetails {
  civil_number: string;
  details: UserDetails;
}

export interface InvitationContext extends GenericInvitationContext {
  user: User;
  customer: Customer;
  project?: Project;
  refetch?(): void;
  enableBulkUpload?: boolean;
}

export interface GroupInviteRow {
  email: string;
  role_project: { role: Role; project?: Project };
  civil_number?: string;
  tax_number?: string;
}

export interface GroupInvitationFormData {
  rows: GroupInviteRow[];
  extra_invitation_text: string;
}
