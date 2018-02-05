import { User } from '@waldur/workspace/types';

export interface UserDetails extends User {
  full_name: string;
  civil_number: string;
  phone_number: string;
  email: string;
  registration_method: string;
  date_joined: string;
  job_title: string;
  is_support: boolean;
}

export interface CurrentUser {
  is_support?: boolean;
  is_staff?: boolean;
}
