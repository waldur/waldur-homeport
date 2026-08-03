import { type TableState } from './types';

export const DASH_ESCAPE_CODE = '\u2014';
export const COLUMN_ACTIONS_KEY = '__actions__';
export const COLUMN_FILTER_TOGGLE_CLASS = 'column-filter-toggle';
export const PAGE_SIZE_COMPACT = 5;
export const PAGE_SIZE_FULL = 10;

export const INITIAL_STATE: TableState = {
  entities: {},
  order: [],
  loading: false,
  error: null,
  mode: 'table',
  pagination: {
    pageSize: 10,
    resultCount: 0,
    currentPage: 1,
  },
  sorting: {
    mode: undefined,
    field: null,
    loading: false,
  },
  filterPosition: 'menu',
  filtersStorage: [],
  registeredFilterNames: [],
  savedFilters: [],
  selectedSavedFilter: null,
  applyFilters: false,
  toggled: {},
  selectedRows: [],
  firstFetch: true,
  activeColumns: {},
  columnPositions: [],
  pinnedColumnKeys: [],
};
