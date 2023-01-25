import { Customer, Project } from '@waldur/workspace/types';

export interface UserDetails {
  full_name: string;
  native_name: string;
  organization: string;
  job_title: string;
}

export interface InvitationContext {
  customer: Customer;
  refetch?(): void;
  project?: Project;
}
