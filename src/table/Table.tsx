import classNames from 'classnames';
import { isEqual } from 'lodash-es';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Card, Stack } from 'react-bootstrap';
import { createPortal } from 'react-dom';
import { useMediaQuery } from 'react-responsive';

import { GRID_BREAKPOINTS } from '@/core/constants';

import { TableContent } from './components/content';
import { TableToolbar, TableToolbarActions } from './components/toolbar';
import { COLUMN_ACTIONS_KEY } from './constants';
import { TableProvider } from './context';
import { FilterContextProvider } from './FilterContextProvider';
import { HiddenActionsMessage } from './HiddenActionsMessage';
import { TableFilterContainer } from './TableFilterContainer';
import { TableFilters } from './TableFilters';
import { TablePagination } from './TablePagination';
import { TableRefreshButton } from './TableRefreshButton';
import { TableTabs } from './TableTabs';
import { Column, PinnedColumns, PinnedOffsets, TableProps } from './types';
import { computePinnedOffsets, computePinnedShadows } from './utils';

import './Table.scss';

const TABLE_DEFAULT_PROPS: Partial<TableProps> = {
  rows: [],
  columns: [],
  rowKey: 'uuid',
  hasQuery: false,
  hasPagination: true,
  hasActionBar: true,
  hasHeaders: true,
  cardBordered: true,
  hoverShadow: true,
  placeholderHasRetry: true,
};

interface TableInternalProps<RowType = any> extends TableProps<RowType> {
  filterPosition: TableProps['filterPosition'];
}

function TableInternal<RowType = any>(inputProps: TableInternalProps<RowType>) {
  // Apply default props
  const props = useMemo(
    () => ({ ...TABLE_DEFAULT_PROPS, ...inputProps }),
    [inputProps],
  );

  // Local state
  const [closedHiddenActionsMessage, setClosedHiddenActionsMessage] =
    useState(false);
  const [showFilterMenuToggle, setShowFilterMenuToggle] = useState(false);
  const [actionsFloating, setActionsFloating] = useState(false);
  const [pinnedOffsets, setPinnedOffsets] = useState<PinnedOffsets>({});
  const [pinnedShadows, setPinnedShadows] = useState<
    Record<string, 'start' | 'end'>
  >({});

  const pinnedColumnKeys = props.pinnedColumnKeys;

  // Geometry of the pinned header cells (natural x within the table, width,
  // sticky insets), captured at measurement time and read on scroll to derive
  // which cells are stuck to an edge.
  const pinnedCellsRef = useRef<
    Array<{
      key: string;
      x: number;
      width: number;
      left: number;
      right: number;
    }>
  >([]);

  // Refs
  const tableResponsiveRef = useRef<HTMLDivElement>(null);
  const prevPaginationRef = useRef(props.pagination);
  const prevQueryRef = useRef(props.query);
  const prevFiltersStorageRef = useRef(props.filtersStorage);
  const prevSortingRef = useRef(props.sorting);
  const isInitialMountRef = useRef(true);

  // Memoized values
  const hasRows = useMemo(
    () => props.rows && props.rows.length > 0,
    [props.rows],
  );

  // Callbacks
  const toggleFilterMenu = useCallback((show: boolean = null) => {
    setShowFilterMenuToggle((prev) => show ?? !prev);
  }, []);

  const handleHorizontalScroll = useCallback(
    (
      event:
        React.UIEvent<HTMLDivElement, UIEvent> | { target: HTMLDivElement },
    ) => {
      const responsiveEl = event.target as HTMLDivElement;
      const tableEl = responsiveEl?.querySelector('table');

      if (!responsiveEl || !tableEl) return;

      const responsiveWidth =
        responsiveEl.getBoundingClientRect()?.width || responsiveEl.clientWidth;
      const tableWidth =
        tableEl.getBoundingClientRect()?.width || responsiveEl.clientWidth;

      setActionsFloating(
        responsiveWidth + responsiveEl.scrollLeft < tableWidth - 4,
      );
      setPinnedShadows((prev) => {
        const next = computePinnedShadows(
          pinnedCellsRef.current,
          responsiveEl.scrollLeft,
          responsiveEl.clientWidth,
        );
        return isEqual(prev, next) ? prev : next;
      });
    },
    [],
  );

  // Debounced scroll handler
  const debouncedScrollHandler = useMemo(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    return (event: React.UIEvent<HTMLDivElement, UIEvent>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => handleHorizontalScroll(event), 10);
    };
  }, [handleHorizontalScroll]);

  // Measure rendered header cell widths to derive the sticky insets of pinned
  // columns. DOM order is the source of truth for column order. The first
  // `table` under the wrapper is this table itself (nested tables live inside
  // its tbody), and the direct-child scoping below keeps header cells of
  // nested tables — which may reuse the same column ids — out of the
  // measurement.
  const recomputePinnedOffsets = useCallback(() => {
    const tableEl = tableResponsiveRef.current?.querySelector('table');
    const headerCells = tableEl?.querySelectorAll<HTMLElement>(
      ':scope > thead > tr > *',
    );
    // Natural x = cumulative width of the preceding header cells. Computed
    // from widths rather than offsetLeft because a stuck sticky cell reports
    // its displaced position, which would corrupt the geometry.
    const cells: Array<{ key: string; x: number; width: number }> = [];
    let acc = 0;
    Array.from(headerCells || []).forEach((el) => {
      const width = el.getBoundingClientRect().width;
      if (el.dataset.pinKey) {
        cells.push({ key: el.dataset.pinKey, x: acc, width });
      }
      acc += width;
    });
    // Right-stuck pinned columns stack just before the right-pinned actions
    // column, so its width is the base of every `right` inset.
    const actionsTh = tableEl?.querySelector<HTMLElement>(
      ':scope > thead > tr > th.header-actions',
    );
    const offsets = computePinnedOffsets(
      cells,
      pinnedColumnKeys || [],
      actionsTh ? actionsTh.getBoundingClientRect().width : 0,
    );
    pinnedCellsRef.current = cells
      .filter((cell) => offsets[cell.key])
      .map((cell) => ({ ...cell, ...offsets[cell.key] }));
    setPinnedOffsets((prev) => (isEqual(prev, offsets) ? prev : offsets));
    // Re-derive the stuck state from the fresh geometry.
    if (tableResponsiveRef.current) {
      const { scrollLeft, clientWidth } = tableResponsiveRef.current;
      setPinnedShadows((prev) => {
        const next = computePinnedShadows(
          pinnedCellsRef.current,
          scrollLeft,
          clientWidth,
        );
        return isEqual(prev, next) ? prev : next;
      });
    }
  }, [pinnedColumnKeys]);

  useEffect(() => {
    recomputePinnedOffsets();
    const tableEl = tableResponsiveRef.current?.querySelector('table');
    if (!tableEl || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => recomputePinnedOffsets());
    observer.observe(tableEl);
    return () => observer.disconnect();
  }, [
    recomputePinnedOffsets,
    props.rows,
    props.activeColumns,
    props.columnPositions,
    props.mode,
  ]);

  // Merged pin record consumed by header/body cells: key present = pinned;
  // the value marks the edge of the floating shadow (see PinnedColumns).
  // When data columns are stuck at the right edge they form one floating
  // group with the actions column — the group's left-boundary shadow (on its
  // leftmost cell) replaces the actions column's own shadow.
  const pinnedColumns = useMemo<PinnedColumns>(() => {
    const hasRightStuckGroup = Object.values(pinnedShadows).includes('start');
    const merged: PinnedColumns = {
      [COLUMN_ACTIONS_KEY]: actionsFloating && !hasRightStuckGroup,
    };
    Object.keys(pinnedOffsets).forEach((key) => {
      merged[key] = pinnedShadows[key] ?? false;
    });
    return merged;
  }, [actionsFloating, pinnedOffsets, pinnedShadows]);

  // Track whether we've applied the initial mode resolver
  const initialModeResolvedRef = useRef(false);

  // Lifecycle: componentDidMount equivalent
  useEffect(() => {
    if (props.initialMode && !props.initialModeResolver) {
      props.setDisplayMode(props.initialMode);
    }

    const doFetch = !props.initialPageSize && !props.initialSorting;

    if (props.initialPageSize) {
      props.updatePageSize(props.initialPageSize);
    }

    if (props.initialSorting) {
      props.sortList(props.initialSorting);
    }

    if (
      props.loading ||
      props.rows.length ||
      props.error ||
      !props.firstFetch
    ) {
      return;
    }

    if (doFetch) {
      props.fetch();
    }
  }, []);

  // Lifecycle: componentDidUpdate equivalent for pagination, query, filters, sorting
  useEffect(() => {
    // Skip initial mount
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      return;
    }

    const prevPagination = prevPaginationRef.current;
    const prevQuery = prevQueryRef.current;
    const prevFiltersStorage = prevFiltersStorageRef.current;
    const prevSorting = prevSortingRef.current;

    // Update refs for next comparison
    prevPaginationRef.current = props.pagination;
    prevQueryRef.current = props.query;
    prevFiltersStorageRef.current = props.filtersStorage;
    prevSortingRef.current = props.sorting;

    if (prevPagination?.currentPage !== props.pagination?.currentPage) {
      props.fetch();
    } else if (prevPagination?.pageSize !== props.pagination?.pageSize) {
      props.resetPagination();
      props.fetch();
    } else if (prevQuery !== props.query) {
      props.resetPagination();
      props.fetch();
    } else if (!isEqual(prevFiltersStorage, props.filtersStorage)) {
      props.resetPagination();
    } else if (prevSorting !== props.sorting && props.sorting?.loading) {
      props.fetch();
    }

    // Fire the scroll handler fn to check floating state of pinned columns
    if (tableResponsiveRef.current) {
      handleHorizontalScroll({ target: tableResponsiveRef.current });
    }
  }, [
    props.pagination,
    props.query,
    props.filtersStorage,
    props.sorting,
    props.fetch,
    props.resetPagination,
    handleHorizontalScroll,
  ]);

  // Auto-show filter bar when filters are loaded (e.g., from URL)
  useEffect(() => {
    if (props.filtersStorage?.length > 0 && !showFilterMenuToggle) {
      setShowFilterMenuToggle(true);
    }
  }, [props.filtersStorage?.length]);

  // Apply initialModeResolver after first data fetch
  useEffect(() => {
    if (
      props.initialModeResolver &&
      !initialModeResolvedRef.current &&
      props.pagination?.resultCount !== undefined &&
      !props.loading
    ) {
      const resolvedMode = props.initialModeResolver(
        props.pagination.resultCount,
      );
      props.setDisplayMode(resolvedMode);
      initialModeResolvedRef.current = true;
    }
  }, [
    props.initialModeResolver,
    props.pagination?.resultCount,
    props.loading,
    props.setDisplayMode,
  ]);

  // Lifecycle: componentWillUnmount equivalent
  useEffect(() => {
    return () => {
      props.resetSelection?.();
    };
  }, []);

  // Early return for hideIfEmpty
  if (props.hideIfEmpty && !hasRows) {
    return null;
  }

  return (
    <FilterContextProvider
      {...props}
      table={props.table}
      toggleFilterMenu={toggleFilterMenu}
    >
      <TableProvider
        {...props}
        toggleFilterMenu={toggleFilterMenu}
        showFilterMenuToggle={showFilterMenuToggle}
        pinnedColumns={pinnedColumns}
        pinnedOffsets={pinnedOffsets}
      >
        {/* Standalone header */}
        {props.standalone && (
          <div className="table-standalone-header d-flex justify-content-between gap-4">
            <div>
              <Stack direction="horizontal" gap={2}>
                <h1 className="mb-0 fs-1x">
                  {props.title || props.alterTitle}
                </h1>
                {!props.hideRefresh && (
                  <TableRefreshButton
                    fetch={props.fetch}
                    loading={props.loading}
                  />
                )}
              </Stack>
              {Boolean(props.subtitle) && (
                <p
                  className={classNames(
                    'fs-4 fw-normal d-block text-muted mb-0',
                    props.hideRefresh && 'mt-2',
                  )}
                >
                  {props.subtitle}
                </p>
              )}
            </div>
            {!props.standaloneActionsInTable && (
              <div className="d-none d-sm-flex gap-4">{props.tableActions}</div>
            )}
          </div>
        )}

        {/* Main card */}
        <Card
          className={classNames(
            'card-table',
            props.fullWidth && 'full-width',
            props.cardBordered && 'card-bordered',
            props.fieldName ? 'field-table' : '',
            props.mode === 'grid' && Boolean(props.gridItem) && 'grid-table',
            props.className,
          )}
          id={props.id}
        >
          {/* Toolbar (Card.Header with title and actions) */}
          <TableToolbar />

          {/* Portals */}
          {Boolean(props.portal?.refresh) &&
            createPortal(
              <TableRefreshButton
                fetch={props.fetch}
                loading={props.loading}
              />,
              props.portal?.refresh,
            )}
          {Boolean(props.portal?.toolbar) &&
            createPortal(<TableToolbarActions />, props.portal.toolbar)}

          {/* Tabs */}
          {props.tabs?.length ? (
            <Card.Header className="table-tabs border-bottom align-items-stretch py-0 min-h-auto">
              <TableTabs tabs={props.tabs} />
            </Card.Header>
          ) : null}

          {/* Header filters */}
          {props.filterPosition === 'header' && props.filters ? (
            <Card.Header className="table-filter border-bottom align-items-stretch">
              <TableFilterContainer
                filters={props.filters}
                formId={props.formId}
              />
            </Card.Header>
          ) : null}

          {/* Menu/Sidebar filters */}
          {props.filters
            ? (props.filterPosition === 'menu' ||
                (props.filterPosition === 'sidebar' &&
                  props.filtersStorage.length > 0)) && (
                <Card.Header
                  className={classNames('border-bottom min-h-auto py-2', {
                    'd-none':
                      !showFilterMenuToggle && props.filterPosition === 'menu',
                  })}
                >
                  <TableFilters
                    table={props.table}
                    filtersStorage={props.filtersStorage}
                    filters={props.filters}
                    formId={props.formId}
                    renderFiltersDrawer={props.renderFiltersDrawer}
                    hideClearFilters={props.hideClearFilters}
                    filterPosition={props.filterPosition}
                    setFilter={props.setFilter}
                    applyFiltersFn={props.applyFiltersFn}
                    selectedSavedFilter={props.selectedSavedFilter}
                  />
                </Card.Header>
              )
            : null}

          {/* Hidden actions warning */}
          {!closedHiddenActionsMessage &&
            props.hasOptionalColumns &&
            props.activeColumns[COLUMN_ACTIONS_KEY] === false && (
              <Card.Header className="border-bottom">
                <HiddenActionsMessage
                  toggleColumn={props.toggleColumn}
                  close={() => setClosedHiddenActionsMessage(true)}
                />
              </Card.Header>
            )}

          {/* Main content */}
          <Card.Body className={props.bodyClassName}>
            <div
              ref={tableResponsiveRef}
              className="table-responsive dataTables_wrapper"
              style={{ minHeight: props.minHeight || 300 }}
              onScroll={debouncedScrollHandler}
            >
              <TableContent />
            </div>
            {props.hasPagination && (
              <TablePagination
                {...props.pagination}
                hasRows={hasRows}
                showPageSizeSelector={props.showPageSizeSelector}
                updatePageSize={props.updatePageSize}
                gotoPage={props.gotoPage}
              />
            )}
            {props.footer}
          </Card.Body>
        </Card>
      </TableProvider>
    </FilterContextProvider>
  );
}

function Table<RowType = any>(props: TableProps<RowType>) {
  const {
    fetch,
    filterPosition: originalFilterPosition,
    setFilterPosition,
    applyFilters,
    applyFiltersFn,
    filters,
    renderFiltersDrawer,
    hasOptionalColumns,
    columns,
    toggleColumn,
    activeColumns,
    rowActions,
    initColumnPositions,
  } = props;

  const isSm = useMediaQuery({ maxWidth: GRID_BREAKPOINTS.sm });

  const filterPosition =
    isSm && originalFilterPosition === 'menu'
      ? 'sidebar'
      : originalFilterPosition;

  // Initialize filter position
  useEffect(() => {
    setFilterPosition(originalFilterPosition);
  }, []);

  // Initialize filters
  useEffect(() => {
    if (filterPosition === 'sidebar') {
      renderFiltersDrawer(filters, props.formId);
    } else if (filterPosition === 'menu') {
      applyFiltersFn(true);
    }
  }, []);

  // Fetch when filters are applied
  useEffect(() => {
    if (filterPosition === 'header' || applyFilters) {
      fetch();
    }
  }, [fetch, filterPosition, applyFilters]);

  // Initialize optional columns
  useEffect(() => {
    if (columns?.length && hasOptionalColumns) {
      columns.forEach((column) => {
        toggleColumn(column.id, column, column.optional ? false : true);
      });
      if (rowActions) {
        toggleColumn(COLUMN_ACTIONS_KEY, { keys: [] }, true);
      }
    }
  }, []);

  // Refetch when columns are added
  const prevActiveCols = useRef<string[]>([]);
  useEffect(() => {
    const currentKeys = Object.entries(activeColumns)
      .filter(([, v]) => Boolean(v))
      .map(([key]) => key);
    const isSubset = currentKeys.every((k) =>
      prevActiveCols.current.includes(k),
    );

    if (!isSubset) {
      fetch();
      prevActiveCols.current = currentKeys;
    }
  }, [activeColumns, fetch]);

  // Initialize column positions
  useEffect(() => {
    if (columns?.length) {
      initColumnPositions(columns.map((column) => column.id));
    }
  }, []);

  return <TableInternal {...props} filterPosition={filterPosition} />;
}

/**
 * Public columns prop. Feature-gated columns are commonly declared inline as
 * `condition && { title, render }`, which yields a falsy entry when the
 * condition is off. Allow those here so call sites are type-safe without an
 * explicit `.filter(Boolean)`.
 */
export type TableColumns<RowType = any> = Array<
  Column<RowType> | false | null | undefined
>;

export type TableLoaderProps<RowType = any> = Omit<
  TableProps<RowType>,
  'columns'
> & {
  columns?: TableColumns<RowType>;
};

export default function TableLoader<RowType = any>({
  columns,
  ...props
}: TableLoaderProps<RowType>) {
  // Drop falsy entries centrally. The header renders a <th> for every column
  // while the body skips columns without a render function, so a leftover
  // falsy entry desyncs the two and shifts every subsequent column.
  const filteredColumns = useMemo(
    () => (columns ?? []).filter(Boolean) as Array<Column<RowType>>,
    [columns],
  );
  return (
    <Table {...(props as TableProps<RowType>)} columns={filteredColumns} />
  );
}
