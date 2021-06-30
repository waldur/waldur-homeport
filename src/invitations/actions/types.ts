import { Customer } from '@waldur/workspace/types';

export interface UserDetails {
  full_name: string;
  native_name: string;
  organization: string;
  job_title: string;
}

export interface InvitationContext {
  customer: Customer;
  refreshList?(): void;
}
