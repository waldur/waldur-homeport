export interface Quota {
  url: string;
  uuid: string;
  name: string;
  limit: number;
  usage: number;
  label?: string;
}

export interface Project {
  url: string;
  uuid: string;
  name: string;
  customer: string;
  customer_uuid: string;
  customer_name: string;
  customer_native_name: string;
  customer_abbreviation: string;
  description: string;
  quotas: Quota[];
  services: Array<{ [key: string]: string | boolean }>;
  created: Date;
  certifications: any[];
  type: string;
  type_name: string;
  billing_price_estimate: { [key: string]: string | number };
}

export interface Payload {
  customerName: string;
  projects: Project[];
  error: any;
  searchValue: string;
  projectUuid: string;
  quotaUuid: string;
  quotas: string;
}

export interface State {
  loading: boolean;
  errors: any[];
  projects: any[];
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
  options: { [key: string]: any };
}
