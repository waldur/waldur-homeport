/** The paging state a table's footer renders from (1-based currentPage). */
export interface PaginationState {
  resultCount: number;
  currentPage: number;
  pageSize: number;
}
