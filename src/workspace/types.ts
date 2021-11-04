export interface CustomerPermission extends Permission {
  customer_name: string;
  customer_uuid: string;
}

export interface ProjectPermission extends CustomerPermission {
  project_name: string;
  project_uuid: string;
}

export interface User {
  is_staff: boolean;
  is_support: boolean;
  url: string;
  uuid: string;
  username?: string;
  customer_permissions?: CustomerPermission[];
  project_permissions?: ProjectPermission[];
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
  affiliations?: string[];
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
  customer_uuid?: string;
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
  total: string;
  current: string;
  tax: string;
  tax_current: string;
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
  backend_id?: string;
}

export type PhoneNumber =
  | string
  | {
      national_number: string;
      country_code: string;
    };

// Customer has only two mandatory fields: name and email, rest are optional.
export interface Customer {
  url?: string;
  uuid?: string;
  email: string;
  name: string;
  display_name?: string;
  abbreviation?: string;
  access_subnets?: string;
  accounting_start_date?: string;
  address?: string;
  agreement_number?: string;
  sponsor_number?: string;
  bank_account?: string;
  bank_name?: string;
  contact_details?: string;
  country_name?: string;
  country?: string;
  default_tax_percent?: string;
  native_name?: string;
  phone_number?: PhoneNumber;
  postal?: string;
  registration_code?: string;
  domain?: string;
  homepage?: string;
  vat_code?: string;
  image?: string;
  is_service_provider?: boolean;
  created?: string;
  division?: string;
  division_name?: string;
  division_parent_name?: string;
  latitude?: number;
  longitude?: number;
  owners?: User[];
  billing_price_estimate?: BillingPriceEstimate;
  service_managers?: User[];
  projects?: Project[];
  payment_profiles?: PaymentProfile[];
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
