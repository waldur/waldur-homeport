import { AxiosRequestConfig } from 'axios';
import React from 'react';

interface RequestConfigExtended extends AxiosRequestConfig {
  staleTime?: number;
}

export interface TableRequest {
  pageSize: number;
  currentPage: number;
  filter?: any;
  query?: string;
  sortField?: string;
  sortOrder?: boolean;
  options?: RequestConfigExtended;
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
  mapPropsToTableId?(props: any): string[];
  table: string;
  fetchData: any;
  onFetch?: (rows: RowType[], totalCount: number, firstFetch: boolean) => void;
  staleTime?: number;
  queryField?: string;
  exportFields?: string[] | ((props: any) => string[]);
  exportRow?: (row: RowType, props: any) => string[];
  exportAll?: boolean;
  getDefaultFilter?: (state: any) => any;
  mapPropsToFilter?: (props: any) => any;
  placeholderComponent?: React.ComponentType;
  pullInterval?: number | (() => number);
  filters?: React.ReactNode;
  filter?;
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
  filterVisible?: boolean;
  selectedRows?: any[];
  firstFetch?: boolean;
}

export interface Sorting {
  field: string;
  mode: undefined | 'asc' | 'desc';
}

export interface SortingState extends Sorting {
  loading?: boolean;
}

export interface TableDropdownItem {
  label: string;
  icon?: string;
  action?: () => void;
  children?: Array<{
    label: string;
    icon?: string;
    action: () => void;
  }>;
}
