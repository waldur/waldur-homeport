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
import { PinnedColumns, TableProps } from './types';

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
  const [pinnedColumns, setPinnedColumns] = useState<PinnedColumns>({
    [COLUMN_ACTIONS_KEY]: false,
  });

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

      const actionsIsFloating =
        responsiveWidth + responsiveEl.scrollLeft < tableWidth - 4;

      setPinnedColumns((prev) => {
        if (prev[COLUMN_ACTIONS_KEY] !== actionsIsFloating) {
          return {
            ...prev,
            [COLUMN_ACTIONS_KEY]: actionsIsFloating,
          };
        }
        return prev;
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

export default function TableLoader<RowType = any>(props: TableProps<RowType>) {
  return <Table {...props} />;
}
