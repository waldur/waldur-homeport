export interface User {
  is_staff: boolean;
  is_support: boolean;
  url: string;
  uuid: string;
}

export interface UserDetails extends User {
  full_name: string;
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
}

export interface Customer {
  name: string;
  uuid: string;
  url: string;
  owners: User[];
}

interface Permission {
  user_uuid: string;
  role: string;
}

export interface Project {
  name: string;
  uuid: string;
  url: string;
  permissions: Permission[];
}

export interface Workspace {
  user: User;
  customer?: Customer;
  project?: Project;
}

export interface OuterState {
  workspace: Workspace;
}
