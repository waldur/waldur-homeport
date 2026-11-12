import { PAGE_SIZE_FULL } from 'waldur-api-client';
import { PAGE_SIZE_COMPACT } from 'waldur-ui';

import { type RowVariant, type TableState } from './types';

export { PAGE_SIZE_FULL, PAGE_SIZE_COMPACT };
export const DASH_ESCAPE_CODE = '\u2014';
export const COLUMN_ACTIONS_KEY = '__actions__';

/**
 * The tint of a row carrying a status, from the status matrix, so both themes
 * are covered and the colour linters have a token to check. Used by `Table`'s
 * `rowVariant` prop, and directly by a row of waldur-ui's `Table` primitives.
 */
export const ROW_VARIANT_CLASSES = {
  danger: 'bg-danger-subtle',
  warning: 'bg-warning-subtle',
  success: 'bg-success-subtle',
  neutral: 'bg-neutral-subtle',
} as const satisfies Record<RowVariant, string>;

export const ROW_VARIANT_BG_VARS = {
  danger: '[--table-row-bg:var(--status-danger-bg)]',
  warning: '[--table-row-bg:var(--status-warning-bg)]',
  success: '[--table-row-bg:var(--status-success-bg)]',
  neutral: '[--table-row-bg:var(--status-neutral-bg)]',
} as const satisfies Record<RowVariant, string>;

export const INITIAL_STATE: TableState = {
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
