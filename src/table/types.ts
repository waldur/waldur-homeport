import { AxiosRequestConfig } from 'axios';
import React, { ReactNode } from 'react';

import { TableFiltersGroup } from './TableFilterService';

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
  table: string;
  fetchData: any;
  onFetch?: (rows: RowType[], totalCount: number, firstFetch: boolean) => void;
  staleTime?: number;
  queryField?: string;
  exportFields?: string[] | ((props: any) => string[]);
  exportKeys?: string[];
  exportData?: (rows: RowType[], props: any) => string[][];
  exportRow?: (row: RowType, props: any) => string[];
  placeholderComponent?: React.ComponentType;
  pullInterval?: number | (() => number);
  filters?: React.ReactNode;
  filter?;
}

export interface Column<RowType = any> {
  id?: string;
  title: ReactNode;
  render: React.ComponentType<{ row: RowType }>;
  className?: string;
  orderField?: string;
  visible?: boolean;
  /** The keys that are required for optional columns to be fetched. */
  keys?: string[];
  optional?: boolean;
  filter?: string;
  export?: string | boolean | ((row: RowType) => string | number);
  exportTitle?: string;
  exportKeys?: string[];
}

export type DisplayMode = 'table' | 'grid';

export type FilterPosition = 'menu' | 'sidebar' | 'header';

export interface Pagination {
  resultCount: number;
  currentPage: number;
  pageSize: number;
}

export interface FilterItem {
  label: string;
  name: string;
  value: any;
  component: () => JSX.Element;
}

export interface TableState {
  entities?: Record<string, any>;
  order?: string[];
  loading?: boolean;
  blocked?: boolean;
  error?: any;
  mode?: DisplayMode;
  pagination?: Pagination;
  query?: string;
  sorting?: SortingState;
  filterPosition?: FilterPosition;
  filtersStorage?: FilterItem[];
  savedFilters?: TableFiltersGroup[];
  selectedSavedFilter?: TableFiltersGroup;
  /** Don't apply the filters at first (let's set it `false`), because the filters are empty and the request will be invalid. \
   * Therefore, in the next renders, this variable will be changed to `true` to read the actual filters. */
  applyFilters?: boolean;
  toggled?: Record<string, boolean>;
  selectedRows?: any[];
  firstFetch?: boolean;
  activeColumns: Record<string, boolean>;
  columnPositions: string[];
}

export interface Sorting {
  field: string;
  mode: undefined | 'asc' | 'desc';
}

interface SortingState extends Sorting {
  loading?: boolean;
}

export interface TableDropdownItem {
  label: string;
  iconNode?: ReactNode;
  action?: () => void;
  children?: Array<{
    label: string;
    iconNode?: ReactNode;
    action: () => void;
  }>;
  isMobileAction?: boolean;
}

export interface ExportConfig {
  format: 'clipboard' | 'pdf' | 'excel' | 'csv';
  withFilters?: boolean;
  allPages?: boolean;
}

export type DropdownActionItemType<T = any> = React.ComponentType<{
  row?: T;
  refetch?(): void;
  as?: React.ComponentType;
}>;
