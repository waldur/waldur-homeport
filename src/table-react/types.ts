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

interface TableResponse<RowType = any> {
  rows: RowType[];
  resultCount: number;
  nextPage: number;
}

export type Fetcher = <RowType = any>(
  request: TableRequest,
) => Promise<TableResponse<RowType>>;

export interface TableOptionsType<RowType = any> {
  table: string;
  fetchData: any;
  queryField?: string;
  exportFields?: string[] | ((props: any) => string[]);
  exportRow?: (row: RowType, props: any) => string[];
  exportAll?: boolean;
  getDefaultFilter?: (state: any) => any;
  mapPropsToFilter?: (props: any) => any;
  placeholderComponent?: React.ComponentType;
  pullInterval?: number | (() => number);
}

export interface Column<RowType = any> {
  title: string;
  render: React.ComponentType<{ row: RowType }>;
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
  entities?: Record<string, any>;
  order?: string[];
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
