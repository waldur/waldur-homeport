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
  quotas: Quota[];
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
