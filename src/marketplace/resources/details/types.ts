import { ResourceState } from '../types';

interface DataRow {
  name: string;
  state?: ResourceState;
  summary: string;
  marketplace_resource_uuid?: string;
  project_uuid?: string;
}

export interface DataPage {
  nextPage: number;
  data: DataRow[];
}
