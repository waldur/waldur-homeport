import { createContext, ReactNode } from 'react';

import {
  Column,
  DisplayMode,
  FilterItem,
  FilterPosition,
  Pagination,
  PinnedColumns,
  Sorting,
  TableProps,
} from '../types';

/**
 * Internal table actions - callbacks from useTable hook
 */
interface TableActions<TData = any> {
  fetch: (force?: boolean) => void;
  gotoPage: (page: number) => void;
  updatePageSize: (size: number) => void;
  resetPagination: () => void;
  sortList: (sorting: Sorting) => void;
  setQuery: (query: string) => void;
  setFilter: (item: FilterItem) => void;
  setFilterPosition: (position: FilterPosition) => void;
  applyFiltersFn: (apply: boolean) => void;
  setDisplayMode: (mode: DisplayMode) => void;
  toggleRow: (row: any) => void;
  selectRow: (row: TData) => void;
  selectAllRows: (rows: TData[]) => void;
  resetSelection: () => void;
  toggleColumn: (id: string, column: Column<TData>, value?: boolean) => void;
  initColumnPositions: (ids: string[]) => void;
  swapColumns: (column1: string, column2: string) => void;
  toggleFilterMenu: (show?: boolean) => void;
  openFiltersDrawer: (filters: ReactNode) => void;
  renderFiltersDrawer: (filters: ReactNode) => void;
}

/**
 * Internal table configuration - UI flags derived from props
 */
interface TableConfig {
  table: string;
  rowKey: string;
  hasQuery: boolean;
  hasPagination: boolean;
  hasActionBar: boolean;
  hasHeaders: boolean;
  hasOptionalColumns: boolean;
  isRowExpandable?: (row: any) => boolean;
  enableMultiSelect: boolean;
  enableExport: boolean;
  showExportInDropdown: boolean;
  showPageSizeSelector: boolean;
  hoverable: boolean;
  hoverShadow: { table?: boolean; grid?: boolean } | boolean;
  cardBordered: boolean;
  fullWidth: boolean;
  minHeight: number | 'auto';
  equalColWidth: boolean;
  standalone: boolean;
  standaloneActionsInTable: boolean;
  hideClearFilters: boolean;
  hideRefresh: boolean;
  hideTitle: boolean;
  hideIfEmpty: boolean;
  placeholderHasRetry: boolean;
  hideExpandAllHeader: boolean;
}

/**
 * Internal table slots - custom components passed as props
 */
interface TableSlots<TData = any> {
  gridItem?: React.ComponentType<{ row: TData }>;
  expandableRow?: React.ComponentType<{ row: TData; fetch: () => void }>;
  rowActions?: React.ComponentType<{ row: TData; fetch: () => void }>;
  multiSelectActions?: React.ComponentType<{
    rows: TData[];
    refetch: () => void;
  }>;
  placeholderComponent?: React.ReactNode;
  placeholderActions?: React.ReactNode;
  filters?: JSX.Element;
  tableActions?: React.ReactNode;
  dropdownActions?: React.ReactNode;
  footer?: React.ReactNode;
  tabs?: TableProps['tabs'];
}

/**
 * Internal table display props - title, styling, etc.
 */
interface TableDisplay {
  title?: React.ReactNode;
  alterTitle?: React.ReactNode;
  subtitle?: React.ReactNode;
  verboseName?: string;
  emptyMessage?: React.ReactNode;
  className?: string;
  headerClassName?: string;
  titleClassName?: string;
  expandableRowClassName?: string;
  id?: string;
  rowClass?: (({ row }: { row: any }) => string) | string;
  gridSize?: TableProps['gridSize'];
  gridSpace?: number;
  gridFixedWidth?: boolean;
}

/**
 * Complete table context value - internal use only
 */
export interface TableContextValue<TData = any> {
  // Data
  rows: TData[];
  columns: Column<TData>[];
  visibleColumns: Column<TData>[];

  // State
  loading: boolean;
  error: any;
  pagination: Pagination;
  sorting: Sorting;
  mode: DisplayMode;
  query: string;
  firstFetch: boolean;
  applyFilters: boolean;

  // Selection
  selectedRows: TData[];
  toggled: Record<string, boolean>;

  // Columns
  activeColumns: Record<string, string[] | false>;
  columnPositions: string[];
  pinnedColumns: PinnedColumns;

  // Filters
  filter?: Record<string, any>;
  filterPosition: FilterPosition;
  filtersStorage: FilterItem[];
  showFilterMenuToggle: boolean;
  selectedSavedFilter?: any;

  // Computed flags
  hasRows: boolean;
  showTitle: boolean;
  showActionsColumn: boolean;

  // Actions
  actions: TableActions<TData>;

  // Config
  config: TableConfig;

  // Slots
  slots: TableSlots<TData>;

  // Display
  display: TableDisplay;

  // Form field props (for redux-form integration)
  fieldType?: 'checkbox' | 'radio';
  fieldName?: string;
  validate?: any;

  // Portal
  portal?: TableProps['portal'];

  // Refs
  tableResponsiveRef: React.RefObject<HTMLDivElement>;
}

export const TableContext = createContext<TableContextValue | null>(null);
