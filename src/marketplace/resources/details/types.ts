import { StateIndicatorProps } from '@waldur/core/StateIndicator';

interface DataRow {
  name: string;
  state?: StateIndicatorProps;
  summary?: string;
  marketplace_resource_uuid?: string;
  url?: string;
  project_uuid?: string;
}

export interface DataPage {
  nextPage: number;
  data: DataRow[];
}
