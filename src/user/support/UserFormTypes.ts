import { GenderEnum, User } from 'waldur-js-client';

export interface UserFormData {
  username: string;
  email: string;
  is_active: boolean;
  is_staff: boolean;
  is_support: boolean;
  can_use_personal_access_tokens: boolean;
  first_name?: string;
  last_name?: string;
  native_name?: string;
  organization?: string;
  job_title?: string;
  phone_number?: string;
  description?: string;
  personal_title?: string;
  gender?: GenderEnum;
  place_of_birth?: string;
  country_of_residence?: string;
  nationality?: string;
  nationalities?: string[];
  organization_country?: string;
  organization_type?: string;
  organization_registry_code?: string;
  organization_vat_code?: string;
  organization_address?: string;
  password?: string;
  remove_password?: boolean;
  deactivation_reason?: string;
}

export interface UserFormDialogData {
  editMode: boolean;
  user?: User;
}
