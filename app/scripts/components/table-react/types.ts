import * as React from 'react';

interface TableRequest {
  pageSize: number;
  currentPage: number;
  filter?: any;
  query?: string;
  sortField?: string;
  sortOrder?: boolean;
}

type Entity = any;

interface TableResponse {
  rows: Entity[];
  resultCount: number;
}

export type Fetcher = (request: TableRequest) => Promise<TableResponse>;

export interface TableOptions {
  table: string;
  fetchData: any;
  queryField?: string;
  exportFields?: string[];
  exportRow?: (Entity) => string[];
  getDefaultFilter?: (state: any) => any;
  mapPropsToFilter?: (props: any) => any;
}

export interface Column {
  title: string;
  render: React.SFC<{row: Entity}>;
  className?: string;
}

export interface Pagination {
  resultCount: number;
  currentPage: number;
  pageSize: number;
}

export interface TableState {
  rows?: any[];
  loading?: boolean;
  error?: any;
  pagination?: Pagination;
  query?: string;
}
