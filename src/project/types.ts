import {
  PROJECT_MANAGER_ROLE,
  PROJECT_ADMIN_ROLE,
  PROJECT_MEMBER_ROLE,
} from '@waldur/core/constants';

export interface ProjectTeamUser {
  uuid: string;
  url?: string;
  username?: string;
  full_name?: string;
  email?: string;
  role:
    | typeof PROJECT_MANAGER_ROLE
    | typeof PROJECT_ADMIN_ROLE
    | typeof PROJECT_MEMBER_ROLE;
  permission?: string;
  expiration_time?: any;
}

export interface InvoiceCostSummary {
  year: number;
  month: number;
  price: number;
}
