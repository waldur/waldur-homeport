interface RequestConfigExtended extends RequestInit {
  staleTime?: number;
  params?: Record<string, any>;
}

export interface TableRequest {
  tableKey: string;
  pageSize: number;
  currentPage: number;
  filter?: any;
  query?: string;
  sortField?: string;
  sortOrder?: boolean;
  options?: RequestConfigExtended;
}

interface TableResponse<RowType = any> {
  rows: RowType[];
  resultCount?: number;
  nextPage?: number;
}

export type Fetcher<RowType = any> = (
  request: TableRequest,
) => Promise<TableResponse<RowType>>;

export type FetcherOptions<
  QueryPayload = any,
  PathPayload = any,
  RowType = any,
> = {
  query?: QueryPayload;
  path?: PathPayload;
  /** Parser function to transform API response data into row array.
   * Use when the API returns an object with nested array, e.g.:
   * `parser: (data) => data.questions` for `{ questions: [...] }` response
   */
  parser?: (data: any, query?: any) => RowType[];
};
