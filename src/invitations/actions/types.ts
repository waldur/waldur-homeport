import { Role } from '@/permissions/types';
import { Customer, Project, User } from '@/workspace/types';

import { GenericInvitationContext } from '../types';

export interface InvitationContext extends GenericInvitationContext {
  user: User;
  /**
   * Org/project context. Optional — scoped callers (resource invites) omit
   * this and supply `scope` + `rolesOverride` instead.
   */
  customer?: Customer;
  project?: Project;
  refetch?(): void;
  enableBulkUpload?: boolean;
}

export interface GroupInviteRow {
  email: string;
  role_project: { role: Role; project?: Pick<Project, 'uuid' | 'url'> };
  civil_number?: string;
}

export interface GroupInvitationFormData {
  rows: GroupInviteRow[];
  extra_invitation_text: string;
}

export type GroupInvitationType = 'private' | 'public';
