import { TableFiltersGroup } from './TableFilterService';
import {
  DisplayMode,
  ExportConfig,
  FilterItem,
  FilterPosition,
  Sorting,
} from './types';

export const FETCH_LIST_START = 'waldur/table/FETCH_START';
export const FETCH_LIST_DONE = 'waldur/table/FETCH_DONE';
export const FETCH_LIST_ERROR = 'waldur/table/FETCH_ERROR';
export const FETCH_LIST_GOTO_PAGE = 'waldur/table/GOTO_PAGE';
export const SET_MODE = 'waldur/table/SET_MODE';
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
export const SET_FILTER_POSITION = 'waldur/table/SET_FILTER_POSITION';
export const SET_FILTER = 'waldur/table/SET_FILTER';
export const SET_SAVED_FILTERS = 'waldur/table/SET_SAVED_FILTERS';
export const SELECT_SAVED_FILTER = 'waldur/table/SELECT_SAVED_FILTER';
export const APPLY_FILTERS = 'waldur/table/APPLY_FILTERS';
export const TOGGLE_ROW = 'waldur/table/TOGGLE_ROW';
export const SELECT_ROW = 'waldur/table/SELECT_ROW';
export const SELECT_ALL_ROWS = 'waldur/table/SELECT_ALL_ROWS';
export const RESET_SELECTION = 'waldur/table/RESET_SELECTION';
export const TOGGLE_COLUMN = 'waldur/table/TOGGLE_COLUMN';
export const INIT_COLUMN_POSITIONS = 'waldur/table/INIT_COLUMN_POSITIONS';
export const SWAP_COLUMNS = 'waldur/table/SWAP_COLUMNS';

export const fetchListStart = (
  table: string,
  extraFilter?: Record<string, any>,
  pullInterval?: number | (() => number),
) => ({
  type: FETCH_LIST_START,
  payload: {
    table,
    extraFilter,
    pullInterval,
  },
});

export const fetchListDone = (
  table: string,
  entities: object,
  order: number[],
  resultCount: number,
) => ({
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

export const exportTableAs = (table: string, config: ExportConfig, props?) => ({
  type: EXPORT_TABLE_AS,
  payload: {
    table,
    config,
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

export const setMode = (table: string, mode: DisplayMode) => ({
  type: SET_MODE,
  payload: {
    table,
    mode,
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

export const updatePageSize = (table: string, size: number) => ({
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

export const setFilterPosition = (
  table: string,
  filterPosition: FilterPosition,
) => ({
  type: SET_FILTER_POSITION,
  payload: {
    table,
    filterPosition,
  },
});

export const setFilter = (table: string, item: FilterItem) => ({
  type: SET_FILTER,
  payload: {
    table,
    item,
  },
});

export const setSavedFilters = (table: string, items: TableFiltersGroup[]) => ({
  type: SET_SAVED_FILTERS,
  payload: {
    table,
    items,
  },
});

export const selectSavedFilter = (table: string, item: TableFiltersGroup) => ({
  type: SELECT_SAVED_FILTER,
  payload: {
    table,
    item,
  },
});

export const applyFilters = (table: string, apply: boolean) => ({
  type: APPLY_FILTERS,
  payload: {
    table,
    apply,
  },
});

export const toggleRow = (table: string, row: string | number) => ({
  type: TOGGLE_ROW,
  payload: {
    table,
    row,
  },
});

export const selectRow = (table: string, row: any) => ({
  type: SELECT_ROW,
  payload: {
    table,
    row,
  },
});

export const selectAllRows = (table: string, rows: any[]) => ({
  type: SELECT_ALL_ROWS,
  payload: {
    table,
    rows,
  },
});

export const resetSelection = (table: string) => ({
  type: RESET_SELECTION,
  payload: {
    table,
  },
});

export const toggleColumn = (table: string, id, column, value?: boolean) => ({
  type: TOGGLE_COLUMN,
  payload: {
    table,
    id,
    column,
    value,
  },
});

export const initColumnPositions = (
  table: string,
  columnPositions: string[],
) => ({
  type: INIT_COLUMN_POSITIONS,
  payload: {
    table,
    columnPositions,
  },
});

export const swapColumns = (
  table: string,
  column1: string,
  column2: string,
) => ({
  type: SWAP_COLUMNS,
  payload: {
    table,
    column1,
    column2,
  },
});
