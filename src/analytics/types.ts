export interface Quota {
  url: string;
  uuid: string;
  name: string;
  limit: number;
  usage: number;
  label?: string;
}

export interface Project {
  uuid: string;
  name: string;
}

export interface Tenant extends Project {
  name: string;
  uuid: string;
  project_uuid: string;
  quotas: Quota[];
}

export interface Payload {
  customerName: string;
  projects: Project[];
  tenants: Tenant[];
  error: any;
  searchValue: string;
  tenantUuid: string;
  quotaUuid: string;
  quotas: string;
}

export interface State {
  loading: boolean;
  errors: any[];
  projects: Project[];
  tenants: any[];
  searchValue: string;
  quotasHistory: any;
}

export interface ChartData {
  id: string;
  label: string;
  limit?: number;
  exceeds: boolean;
  erred?: boolean;
  loading?: boolean;
  maxFileSizeName: string;
  options: { [key: string]: any };
}

export interface ServiceProvider {
  name: string;
  value: string;
}
