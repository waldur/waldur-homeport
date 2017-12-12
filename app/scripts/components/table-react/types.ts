import * as React from 'react';

type TableRequest = {
  pageSize: number,
  currentPage: number,
  filter?: any,
  query?: string,
  sortField?: string,
  sortOrder?: boolean,
};

type Entity = any;

type TableResponse = {
  rows: Entity[],
  resultCount: number,
};

export type Fetcher = (request: TableRequest) => Promise<TableResponse>;

export type TableOptions = {
  table: string,
  fetchData: any,
  queryField?: string,
  exportFields?: string[],
  exportRow?: (Entity) => string[],
  getDefaultFilter?: (state) => any,
};

export type Column = {
  title: string,
  render: React.SFC<{row: Entity}>,
  className?: string,
};

export type Pagination = {
  resultCount: number,
  currentPage: number,
  pageSize: number,
};

export type TableState = {
  rows?: any[],
  loading?: boolean,
  error?: any,
  pagination?: Pagination,
  query?: string,
};
