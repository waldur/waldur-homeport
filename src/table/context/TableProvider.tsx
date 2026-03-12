import { ReactNode, useMemo, useRef } from 'react';

import { COLUMN_ACTIONS_KEY } from '../constants';
import { PinnedColumns, TableProps } from '../types';

import { TableContext, TableContextValue } from './TableContext';

interface TableProviderProps<TData = any> extends TableProps<TData> {
  children: ReactNode;
  /** Computed filter position (may differ from originalFilterPosition on mobile) */
  filterPosition: TableProps['filterPosition'];
  /** Callback to toggle filter menu visibility */
  toggleFilterMenu: (show?: boolean) => void;
  /** Whether filter menu is currently shown */
  showFilterMenuToggle: boolean;
  /** Pinned columns state for horizontal scroll handling */
  pinnedColumns: PinnedColumns;
}

/**
 * Provider component that creates the table context from props.
 * This is an internal component used by Table to provide context to children.
 *
 * @internal
 */
export function TableProvider<TData = any>({
  children,
  ...props
}: TableProviderProps<TData>) {
  const tableResponsiveRef = useRef<HTMLDivElement>(null);

  // Compute visible columns based on optional columns settings
  const visibleColumns = useMemo(
    () =>
      props.hasOptionalColumns
        ? props.columns.filter(
            (column) => !column.keys || props.activeColumns[column.id],
          )
        : props.columns,
    [props.activeColumns, props.columns, props.hasOptionalColumns],
  );

  // Compute whether actions column should be shown
  const showActionsVisible = useMemo(() => {
    if (props.rowActions && !props.hasOptionalColumns) return true;
    return Boolean(props.activeColumns[COLUMN_ACTIONS_KEY]);
  }, [props.rowActions, props.hasOptionalColumns, props.activeColumns]);

  // Compute derived flags
  const hasRows = useMemo(
    () => props.rows && props.rows.length > 0,
    [props.rows],
  );

  const showTitle = useMemo(
    () => !props.standalone && (!props.hideTitle || !props.hideRefresh),
    [props.standalone, props.hideTitle, props.hideRefresh],
  );

  const showActionsColumn = useMemo(
    () =>
      Boolean(props.enableMultiSelect && props.multiSelectActions) ||
      Boolean(props.tableActions) ||
      Boolean(props.dropdownActions) ||
      Boolean(props.enableExport) ||
      Boolean(props.filters) ||
      Boolean(props.hasOptionalColumns) ||
      Boolean(props.gridItem && props.columns.length),
    [
      props.enableMultiSelect,
      props.multiSelectActions,
      props.tableActions,
      props.dropdownActions,
      props.enableExport,
      props.filters,
      props.hasOptionalColumns,
      props.gridItem,
      props.columns.length,
    ],
  );

  // Build context value
  const contextValue = useMemo<TableContextValue<TData>>(
    () => ({
      // Data
      rows: props.rows,
      columns: props.columns,
      visibleColumns,

      // State
      loading: props.loading,
      error: props.error,
      pagination: props.pagination,
      sorting: props.sorting,
      mode: props.mode,
      query: props.query,
      firstFetch: props.firstFetch,
      applyFilters: props.applyFilters,

      // Selection
      selectedRows: props.selectedRows || [],
      toggled: props.toggled || {},

      // Columns
      activeColumns: props.activeColumns || {},
      columnPositions: props.columnPositions || [],
      pinnedColumns: props.pinnedColumns,

      // Filters
      filter: props.filter,
      filterPosition: props.filterPosition,
      filtersStorage: props.filtersStorage || [],
      showFilterMenuToggle: props.showFilterMenuToggle,
      selectedSavedFilter: props.selectedSavedFilter,

      // Computed flags
      hasRows,
      showTitle,
      showActionsColumn,

      // Actions
      actions: {
        fetch: props.fetch,
        gotoPage: props.gotoPage,
        updatePageSize: props.updatePageSize,
        resetPagination: props.resetPagination,
        sortList: props.sortList,
        setQuery: props.setQuery,
        setFilter: props.setFilter,
        setFilterPosition: props.setFilterPosition,
        applyFiltersFn: props.applyFiltersFn,
        setDisplayMode: props.setDisplayMode,
        toggleRow: props.toggleRow,
        selectRow: props.selectRow,
        selectAllRows: props.selectAllRows,
        resetSelection: props.resetSelection,
        toggleColumn: props.toggleColumn,
        initColumnPositions: props.initColumnPositions,
        swapColumns: props.swapColumns,
        toggleFilterMenu: props.toggleFilterMenu,
        openFiltersDrawer: props.openFiltersDrawer,
        renderFiltersDrawer: props.renderFiltersDrawer,
      },

      // Config
      config: {
        table: props.table,
        rowKey: props.rowKey || 'uuid',
        hasQuery: props.hasQuery ?? false,
        hasPagination: props.hasPagination ?? true,
        hasActionBar: props.hasActionBar ?? true,
        hasHeaders: props.hasHeaders ?? true,
        hasOptionalColumns: props.hasOptionalColumns ?? false,
        isRowExpandable: props.isRowExpandable ?? (() => true),
        enableMultiSelect: props.enableMultiSelect ?? false,
        enableExport: props.enableExport ?? false,
        showExportInDropdown: props.showExportInDropdown ?? false,
        showPageSizeSelector: props.showPageSizeSelector ?? false,
        hoverable: props.hoverable ?? false,
        hoverShadow: props.hoverShadow ?? true,
        cardBordered: props.cardBordered ?? true,
        fullWidth: props.fullWidth ?? false,
        minHeight: props.minHeight ?? 300,
        equalColWidth: props.equalColWidth ?? false,
        standalone: props.standalone ?? false,
        standaloneActionsInTable: props.standaloneActionsInTable ?? false,
        hideClearFilters: props.hideClearFilters ?? false,
        hideRefresh: props.hideRefresh ?? false,
        hideTitle: props.hideTitle ?? false,
        hideIfEmpty: props.hideIfEmpty ?? false,
        placeholderHasRetry: props.placeholderHasRetry ?? true,
      },

      // Slots
      slots: {
        gridItem: props.gridItem,
        expandableRow: props.expandableRow,
        rowActions: showActionsVisible ? props.rowActions : undefined,
        multiSelectActions: props.multiSelectActions,
        placeholderComponent: props.placeholderComponent,
        placeholderActions: props.placeholderActions,
        filters: props.filters,
        tableActions: props.tableActions,
        dropdownActions: props.dropdownActions,
        footer: props.footer,
        tabs: props.tabs,
      },

      // Display
      display: {
        title: props.title,
        alterTitle: props.alterTitle,
        subtitle: props.subtitle,
        verboseName: props.verboseName,
        emptyMessage: props.emptyMessage,
        className: props.className,
        headerClassName: props.headerClassName,
        titleClassName: props.titleClassName,
        expandableRowClassName: props.expandableRowClassName,
        id: props.id,
        rowClass: props.rowClass,
        gridSize: props.gridSize,
        gridSpace: props.gridSpace,
        gridFixedWidth: props.gridFixedWidth,
      },

      // Form field props
      fieldType: props.fieldType,
      fieldName: props.fieldName,
      validate: props.validate,

      // Portal
      portal: props.portal,

      // Refs
      tableResponsiveRef,
    }),
    [
      props.rows,
      props.columns,
      visibleColumns,
      props.loading,
      props.error,
      props.pagination,
      props.sorting,
      props.mode,
      props.query,
      props.firstFetch,
      props.applyFilters,
      props.selectedRows,
      props.toggled,
      props.activeColumns,
      props.columnPositions,
      props.pinnedColumns,
      props.filter,
      props.filterPosition,
      props.filtersStorage,
      props.showFilterMenuToggle,
      props.selectedSavedFilter,
      hasRows,
      showTitle,
      showActionsColumn,
      props.fetch,
      props.gotoPage,
      props.updatePageSize,
      props.resetPagination,
      props.sortList,
      props.setQuery,
      props.setFilter,
      props.setFilterPosition,
      props.applyFiltersFn,
      props.setDisplayMode,
      props.toggleRow,
      props.selectRow,
      props.selectAllRows,
      props.resetSelection,
      props.toggleColumn,
      props.initColumnPositions,
      props.swapColumns,
      props.toggleFilterMenu,
      props.openFiltersDrawer,
      props.renderFiltersDrawer,
      props.table,
      props.rowKey,
      props.hasQuery,
      props.hasPagination,
      props.hasActionBar,
      props.hasHeaders,
      props.hasOptionalColumns,
      props.isRowExpandable,
      props.enableMultiSelect,
      props.enableExport,
      props.showExportInDropdown,
      props.showPageSizeSelector,
      props.hoverable,
      props.hoverShadow,
      props.cardBordered,
      props.fullWidth,
      props.minHeight,
      props.equalColWidth,
      props.standalone,
      props.standaloneActionsInTable,
      props.hideClearFilters,
      props.hideRefresh,
      props.hideTitle,
      props.hideIfEmpty,
      props.placeholderHasRetry,
      props.gridItem,
      props.expandableRow,
      props.rowActions,
      showActionsVisible,
      props.multiSelectActions,
      props.placeholderComponent,
      props.placeholderActions,
      props.filters,
      props.tableActions,
      props.dropdownActions,
      props.footer,
      props.tabs,
      props.title,
      props.alterTitle,
      props.subtitle,
      props.verboseName,
      props.emptyMessage,
      props.className,
      props.headerClassName,
      props.titleClassName,
      props.expandableRowClassName,
      props.id,
      props.rowClass,
      props.gridSize,
      props.gridSpace,
      props.gridFixedWidth,
      props.fieldType,
      props.fieldName,
      props.validate,
      props.portal,
    ],
  );

  return (
    <TableContext.Provider value={contextValue}>
      {children}
    </TableContext.Provider>
  );
}
