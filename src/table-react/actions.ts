import { Sorting } from './types';

export const FETCH_LIST_START = 'waldur/table/FETCH_START';
export const FETCH_LIST_DONE = 'waldur/table/FETCH_DONE';
export const FETCH_LIST_ERROR = 'waldur/table/FETCH_ERROR';
export const FETCH_LIST_GOTO_PAGE = 'waldur/table/GOTO_PAGE';
export const SET_FILTER_QUERY = 'waldur/table/SET_QUERY';
export const EXPORT_TABLE_AS = 'waldur/table/EXPORT';
export const BLOCK_START = 'waldur/table/BLOCK_START';
export const BLOCK_STOP = 'waldur/table/BLOCK_STOP';
export const RESET_PAGINATION = 'waldur/table/RESET_PAGINATION';
export const ENTITY_CREATE = 'waldur/table/ENTITY_CREATE';
export const ENTITY_UPDATE = 'waldur/table/ENTITY_UPDATE';
export const ENTITY_DELETE = 'waldur/table/ENTITY_DELETE';
export const PAGE_SIZE_UPDATE = 'waldur/table/PAGE_SIZE_UPDATE';
export const SORT_LIST_START = 'waldur/table/SORT_LIST_START';
export const SORT_LIST_DONE = 'waldur/table/SORT_LIST_DONE';
export const TOGGLE_ROW = 'waldur/table/TOGGLE_ROW';

export const fetchListStart = (table: string, extraFilter?: any) => ({
  type: FETCH_LIST_START,
  payload: {
    table,
    extraFilter,
  },
});

export const fetchListDone = (table: string, entities: object, order: number[], resultCount: number) => ({
  type: FETCH_LIST_DONE,
  payload: {
    table,
    entities,
    order,
    resultCount,
  },
});

export const fetchListError = (table: string, error: any) => ({
  type: FETCH_LIST_ERROR,
  payload: {
    table,
    error,
  },
});

export const fetchListGotoPage = (table: string, page: number) => ({
  type: FETCH_LIST_GOTO_PAGE,
  payload: {
    table,
    page,
  },
});

export const exportTableAs = (table: string, format: string, props: any) => ({
  type: EXPORT_TABLE_AS,
  payload: {
    table,
    format,
    props,
  },
});

export const blockStart = (table: string) => ({
  type: BLOCK_START,
  payload: {
    table,
  },
});

export const blockStop = (table: string) => ({
  type: BLOCK_STOP,
  payload: {
    table,
  },
});

export const setFilterQuery = (table: string, query: string) => ({
  type: SET_FILTER_QUERY,
  payload: {
    table,
    query,
  },
});

export const resetPagination = (table: string) => ({
  type: RESET_PAGINATION,
  payload: {
    table,
  },
});

export const updatePageSize = (table: string, size: string) => ({
  type: PAGE_SIZE_UPDATE,
  payload: {
    table,
    size,
  },
});

export const createEntity = (table: string, uuid: string, content: object) => ({
  type: ENTITY_CREATE,
  payload: {
    table,
    uuid,
    content,
  },
});

export const updateEntity = (table: string, uuid: string, content: object) => ({
  type: ENTITY_UPDATE,
  payload: {
    table,
    uuid,
    content,
  },
});

export const deleteEntity = (table: string, uuid: string) => ({
  type: ENTITY_DELETE,
  payload: {
    table,
    uuid,
  },
});

export const sortListStart = (table: string, sorting: Sorting) => ({
  type: SORT_LIST_START,
  payload: {
    table,
    sorting,
  },
});

export const sortListDone = (table: string) => ({
  type: SORT_LIST_DONE,
  payload: {
    table,
  },
});

export const toggleRow = (table: string, row: string | number) => ({
  type: TOGGLE_ROW,
  payload: {
    table,
    row,
  },
});
