export const FETCH_LIST_START = 'waldur/table/FETCH_START';
export const FETCH_LIST_DONE = 'waldur/table/FETCH_DONE';
export const FETCH_LIST_ERROR = 'waldur/table/FETCH_ERROR';
export const FETCH_LIST_GOTO_PAGE = 'waldur/table/GOTO_PAGE';
export const SET_FILTER_QUERY = 'waldur/table/SET_QUERY';
export const EXPORT_TABLE_AS = 'waldur/table/EXPORT';
export const OPEN_MODAL_DIALOG = 'waldur/core/OPEN_MODAL_DIALOG';
export const CLOSE_MODAL_DIALOG = 'waldur/core/CLOSE_MODAL_DIALOG';

export const fetchListStart = (table: string) => ({
  type: FETCH_LIST_START,
  payload: {
    table
  }
});

export const fetchListDone = (table: string, rows: Array<any>, resultCount: number) => ({
  type: FETCH_LIST_DONE,
  payload: {
    table,
    rows,
    resultCount,
  }
});

export const fetchListError = (table: string, error: any) => ({
  type: FETCH_LIST_ERROR,
  payload: {
    table,
    error,
  }
});

export const fetchListGotoPage = (table: string, page: number) => ({
  type: FETCH_LIST_GOTO_PAGE,
  payload: {
    table,
    page,
  }
});

export const exportTableAs = (table: string, format: string) => ({
  type: EXPORT_TABLE_AS,
  payload: {
    table,
    format,
  }
});

export const setFilterQuery = (table: string, query: string) => ({
  type: SET_FILTER_QUERY,
  payload: {
    table,
    query
  }
});

export const openModalDialog = (component: string, params?: any) => ({
  type: OPEN_MODAL_DIALOG,
  payload: {
    component,
    params,
  }
});

export const closeModalDialog = () => ({
  type: CLOSE_MODAL_DIALOG,
});
