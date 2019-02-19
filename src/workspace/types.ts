export interface User {
  is_staff: boolean;
  is_support: boolean;
  url: string;
  uuid: string;
  customer_permissions?: Permission[];
  full_name?: string;
}

export interface UserDetails extends User {
  native_name?: string;
  civil_number: string;
  phone_number: string;
  email: string;
  registration_method: string;
  preferred_language: string;
  competence: string;
  date_joined: string;
  organization: string;
  job_title: string;
  is_support: boolean;
  token: string;
  agreement_date: string;
  is_active: boolean;
}

export interface Customer {
  name: string;
  uuid: string;
  url: string;
  owners: User[];
  projects?: Project[];
  is_service_provider?: boolean;
}

interface Permission {
  user_uuid: string;
  role: string;
}

export interface Quota {
  name: string;
  usage: number;
}

interface BillingPriceEstimate {
  total: number;
  current: number;
  limit: number;
  threshold: number;
}

export interface Project {
  name: string;
  uuid: string;
  url: string;
  permissions: Permission[];
  quotas: Quota[];
  billing_price_estimate?: BillingPriceEstimate;
}

export type WorkspaceType = 'user' | 'project' | 'organization' | 'support';

export interface Workspace {
  user: User;
  customer?: Customer;
  project?: Project;
  workspace?: WorkspaceType;
}

export interface OuterState {
  workspace: Workspace;
}
