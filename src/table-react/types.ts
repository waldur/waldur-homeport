import { IPromise } from 'angular';
import * as React from 'react';

export interface TableRequest {
  pageSize: number;
  currentPage: number;
  filter?: any;
  query?: string;
  sortField?: string;
  sortOrder?: boolean;
}

export interface StateTables {
  tables: { [key: string]: TableState };
}

type Entity = any;

interface TableResponse {
  rows: Entity[];
  resultCount: number;
  nextPage: number;
}

export type Fetcher = (request: TableRequest) => IPromise<TableResponse>;

export interface TableOptions {
  table: string;
  fetchData: any;
  queryField?: string;
  exportFields?: string[] | ((props: any) => string []);
  exportRow?: (Entity, props: any) => string[];
  exportAll?: boolean;
  getDefaultFilter?: (state: any) => any;
  mapPropsToFilter?: (props: any) => any;
  placeholderComponent?: React.ComponentType;
}

export interface Column<RowType = Entity> {
  title: string;
  render: React.ComponentType<{row: RowType}>;
  className?: string;
  orderField?: string;
  visible?: boolean;
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
  sorting?: SortingState;
  toggled?: object;
}

export interface Sorting {
  field: string;
  mode: undefined | 'asc' | 'desc';
}

export interface SortingState extends Sorting {
  loading?: boolean;
}
