export interface User {
  is_staff: boolean;
  is_support: boolean;
  url: string;
  uuid: string;
  username?: string;
  customer_permissions?: Permission[];
  project_permissions?: Permission[];
  full_name?: string;
  email?: string;
  job_title?: string;
  organization?: string;
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
  token: string;
  agreement_date: string;
  is_active: boolean;
}

interface PaymentProfileAttributes {
  end_date: string;
  agreement_number: string;
  contract_sum: number;
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

export interface Payment {
  date_of_payment: string;
  sum: string;
  proof: string;
  uuid: string;
  invoice_uuid?: string;
  invoice_period?: string;
}

export interface Customer {
  billing_price_estimate?: {
    total: string;
  };
  name: string;
  uuid: string;
  url: string;
  owners: User[];
  service_managers?: User[];
  projects?: Project[];
  is_service_provider?: boolean;
  abbreviation?: string;
  payment_profiles?: PaymentProfile[];
  agreement_number?: string;
}

export interface Permission {
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
  customer_name?: string;
  customer_abbreviation?: string;
}

export const ORGANIZATION_WORKSPACE = 'WORKSPACE/ORGANIZATION';

export const SUPPORT_WORKSPACE = 'WORKSPACE/SUPPORT';

export const PROJECT_WORKSPACE = 'WORKSPACE/PROJECT';

export const USER_WORKSPACE = 'WORKSPACE/USER';

export type WorkspaceType =
  | typeof ORGANIZATION_WORKSPACE
  | typeof SUPPORT_WORKSPACE
  | typeof PROJECT_WORKSPACE
  | typeof USER_WORKSPACE;

export interface WorkspaceState {
  user: User;
  customer?: Customer;
  project?: Project;
  workspace?: WorkspaceType;
}
