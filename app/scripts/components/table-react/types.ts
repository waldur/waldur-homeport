import * as React from 'react';

export interface TableRequest {
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
  obj: any;
}

export type Fetcher = (request: TableRequest) => angular.IPromise<TableResponse>;

export interface TableOptions {
  table: string;
  fetchData: any;
  queryField?: string;
  exportFields?: string[];
  exportRow?: (Entity) => string[];
  exportAll?: boolean;
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
  entities?: object;
  order?: number[];
  loading?: boolean;
  blocked?: boolean;
  error?: any;
  pagination?: Pagination;
  query?: string;
}
