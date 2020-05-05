export interface User {
  is_staff: boolean;
  is_support: boolean;
  url: string;
  uuid: string;
  customer_permissions?: Permission[];
  full_name?: string;
  email?: string;
  job_title?: string;
}

export interface UserDetails extends User {
  native_name?: string;
  civil_number: string;
  phone_number: string;
  email: string;
  requested_email?: string;
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

interface PaymentProfileAttributes {
  end_date: string;
  agreement_number: string;
}

export interface PaymentProfile {
  is_active: boolean;
  name: string;
  payment_type: string;
  payment_type_display: string;
  organization_uuid: string;
  url: string;
  attributes: PaymentProfileAttributes;
  uuid: string;
}

export interface Customer {
  billing_price_estimate?: {
    total: string;
  };
  name: string;
  uuid: string;
  url: string;
  owners: User[];
  projects?: Project[];
  is_service_provider?: boolean;
  abbreviation?: string;
  payment_profiles?: PaymentProfile[];
  agreement_number?: string;
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
  customer_uuid?: string;
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
