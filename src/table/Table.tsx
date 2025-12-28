import { XIcon } from '@phosphor-icons/react';
import { ErrorBoundary } from '@sentry/react';
import classNames from 'classnames';
import { isEqual } from 'lodash-es';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Button, Card, Col, Row, Stack } from 'react-bootstrap';
import { createPortal } from 'react-dom';
import { useMediaQuery } from 'react-responsive';

import { GRID_BREAKPOINTS } from '@waldur/core/constants';
import { titleCase } from '@waldur/core/utils';
import { ErrorMessage } from '@waldur/ErrorMessage';
import { ErrorView } from '@waldur/ErrorView';
import { translate } from '@waldur/i18n';

import { COLUMN_ACTIONS_KEY } from './constants';
import { FilterContextProvider } from './FilterContextProvider';
import { GridBody } from './GridBody';
import { HiddenActionsMessage } from './HiddenActionsMessage';
import { TableBody } from './TableBody';
import { TableButtons } from './TableButtons';
import { TableFilterContainer } from './TableFilterContainer';
import { TableFilters } from './TableFilters';
import { TableHeader } from './TableHeader';
import { TableLoadingSpinnerContainer } from './TableLoadingSpinnerContainer';
import { TablePagination } from './TablePagination';
import { TablePlaceholder } from './TablePlaceholder';
import { TableQuery } from './TableQuery';
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

const TableElement = (
  props: TableProps & {
    toggleFilterMenu?(show?): void;
    pinnedColumns?: PinnedColumns;
  },
) => {
  const visibleColumns = useMemo(
    () =>
      props.hasOptionalColumns
        ? props.columns.filter(
            (column) => !column.keys || props.activeColumns[column.id],
          )
        : props.columns,
    [props.activeColumns, props.columns, props.hasOptionalColumns],
  );

  const showActions = useMemo(() => {
    if (props.rowActions && !props.hasOptionalColumns) return true;
    return Boolean(props.activeColumns[COLUMN_ACTIONS_KEY]);
  }, [props.rowActions, props.hasOptionalColumns, props.activeColumns]);

  return (
    <table
      className={classNames(
        'table align-middle table-row-bordered fs-6 gy-0 gx-8px no-footer',
        {
          'table-expandable': Boolean(props.expandableRow),
          'table-hover': props.hoverable,
        },
      )}
    >
      {props.hasHeaders && (
        <TableHeader
          rows={props.rows}
          onSortClick={props.sortList}
          currentSorting={props.sorting}
          columns={visibleColumns}
          expandableRow={!!props.expandableRow}
          showActions={showActions}
          enableMultiSelect={props.enableMultiSelect}
          onSelectAllRows={props.selectAllRows}
          selectedRows={props.selectedRows}
          toggleRow={props.toggleRow}
          toggled={props.toggled}
          fieldType={props.fieldType}
          filters={props.filters}
          filtersStorage={props.filtersStorage}
          setFilter={props.setFilter}
          applyFiltersFn={props.applyFiltersFn}
          columnPositions={props.columnPositions}
          hasOptionalColumns={props.hasOptionalColumns}
          toggleFilterMenu={props.toggleFilterMenu}
          pinnedColumns={props.pinnedColumns}
          equalColWidth={props.equalColWidth}
        />
      )}
      <TableBody
        rows={props.rows}
        columns={visibleColumns}
        rowClass={props.rowClass}
        rowKey={props.rowKey}
        expandableRow={props.expandableRow}
        expandableRowClassName={props.expandableRowClassName}
        rowActions={showActions ? props.rowActions : undefined}
        enableMultiSelect={props.enableMultiSelect}
        selectRow={props.selectRow}
        selectedRows={props.selectedRows}
        toggleRow={props.toggleRow}
        toggled={props.toggled}
        fetch={props.fetch}
        fieldType={props.fieldType}
        fieldName={props.fieldName}
        validate={props.validate}
        columnPositions={props.columnPositions}
        hasOptionalColumns={props.hasOptionalColumns}
        pinnedColumns={props.pinnedColumns}
      />
    </table>
  );
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

  // Local state (previously class state)
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

  const showTitle = useMemo(
    () => !props.standalone && (!props.hideTitle || !props.hideRefresh),
    [props.standalone, props.hideTitle, props.hideRefresh],
  );

  const showActionsColumn = useMemo(
    () =>
      (props.enableMultiSelect && props.multiSelectActions) ||
      props.tableActions ||
      Boolean(props.dropdownActions) ||
      props.enableExport ||
      props.filters ||
      props.hasOptionalColumns ||
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

  const gridHover = useMemo(
    () =>
      (typeof props.hoverShadow === 'object'
        ? (props.hoverShadow.grid ?? true)
        : props.hoverShadow) && Boolean(props.gridItem),
    [props.hoverShadow, props.gridItem],
  );

  const tableHover = useMemo(
    () =>
      typeof props.hoverShadow === 'object'
        ? (props.hoverShadow.table ?? true)
        : props.hoverShadow,
    [props.hoverShadow],
  );

  // Callbacks
  const toggleFilterMenu = useCallback((show: boolean = null) => {
    setShowFilterMenuToggle((prev) => show ?? !prev);
  }, []);

  const handleHorizontalScroll = useCallback(
    (
      event:
        | React.UIEvent<HTMLDivElement, UIEvent>
        | { target: HTMLDivElement },
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

  // Lifecycle: componentDidMount equivalent
  useEffect(() => {
    if (props.initialMode) {
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

  // Lifecycle: componentWillUnmount equivalent
  useEffect(() => {
    return () => {
      props.resetSelection?.();
    };
  }, []);

  // Render helpers
  const renderBody = () => {
    if (props.loading && !hasRows) {
      return (
        <h1 className="text-center">
          <TableLoadingSpinnerContainer {...props} />
        </h1>
      );
    }

    if (props.error) {
      return <ErrorView error={props.error} />;
    }

    if (!props.loading && !hasRows) {
      if (props.placeholderComponent) {
        return props.placeholderComponent;
      }
      return (
        <TablePlaceholder
          query={props.query}
          filtersStorage={props.filtersStorage}
          verboseName={props.verboseName}
          emptyMessage={props.emptyMessage}
          clearSearch={() => props.setQuery('')}
          fetch={props.fetch}
          hasRetry={props.placeholderHasRetry}
          actions={props.placeholderActions}
        />
      );
    }

    return props.mode === 'grid' && props.gridItem ? (
      <ErrorBoundary fallback={ErrorMessage}>
        <GridBody
          rows={props.rows}
          gridItem={props.gridItem}
          gridSize={props.gridSize}
        />
      </ErrorBoundary>
    ) : (
      <ErrorBoundary fallback={ErrorMessage}>
        <TableElement
          {...props}
          toggleFilterMenu={toggleFilterMenu}
          pinnedColumns={pinnedColumns}
        />
      </ErrorBoundary>
    );
  };

  const renderActions = () => (
    <>
      {/* Multi-select actions */}
      {props.selectedRows?.length > 0 && props.multiSelectActions && (
        <Col
          xs="auto"
          className="order-1 order-sm-1 d-flex justify-content-start flex-wrap text-nowrap gap-4"
        >
          <Stack direction="horizontal" className="fw-normal text-dark me-2">
            <Button
              variant="text-secondary"
              className="btn-icon me-1"
              size="sm"
              onClick={props.resetSelection}
            >
              <XIcon weight="bold" />
            </Button>
            <span>
              ({props.selectedRows?.length}) {translate('Selected')}
            </span>
          </Stack>
          {React.createElement(props.multiSelectActions, {
            rows: props.selectedRows,
            refetch: () => {
              props.fetch();
              props.resetSelection();
            },
          })}
        </Col>
      )}

      {/* Table Query */}
      {props.hasQuery && (
        <Col
          xs
          className={classNames(
            'order-2 order-sm-2 mw-lg-325px',
            showTitle && 'ms-auto',
          )}
        >
          <TableQuery query={props.query} setQuery={props.setQuery} />
        </Col>
      )}

      {/* Remaining table action buttons */}
      <Col sm="auto" className="order-3 order-sm-3 ms-auto">
        {showActionsColumn && (
          <div className="d-flex justify-content-sm-end flex-wrap flex-sm-nowrap text-nowrap gap-4">
            <TableButtons
              {...props}
              showFilterMenuToggle={showFilterMenuToggle}
              toggleFilterMenu={toggleFilterMenu}
            />
          </div>
        )}
      </Col>
    </>
  );

  // Early return for hideIfEmpty
  if (props.hideIfEmpty && !hasRows) {
    return null;
  }

  return (
    <FilterContextProvider {...props} toggleFilterMenu={toggleFilterMenu}>
      {props.standalone && (
        <div className="table-standalone-header d-flex justify-content-between gap-4">
          <div>
            <Stack direction="horizontal" gap={2}>
              <h1 className="mb-0 fs-1x">{props.title || props.alterTitle}</h1>
              {!props.hideRefresh && <TableRefreshButton {...props} />}
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
        {props.hasActionBar && (
          <Card.Header
            className={classNames('border-bottom', props.headerClassName)}
          >
            <Row className="card-toolbar g-0 gap-4 w-100">
              {showTitle && (
                <Col xs className="order-0">
                  <Card.Title>
                    {!props.hideTitle && (
                      <div className="me-2">
                        <span
                          className={classNames('h3', props.titleClassName)}
                        >
                          {props.title ||
                            props.alterTitle ||
                            (props.verboseName && titleCase(props.verboseName))}
                        </span>
                        {Boolean(props.subtitle) && (
                          <small className="fs-6 fw-normal d-block mt-4px">
                            {props.subtitle}
                          </small>
                        )}
                      </div>
                    )}
                    {!props.hideRefresh && !props.portal?.refresh && (
                      <TableRefreshButton {...props} />
                    )}
                  </Card.Title>
                </Col>
              )}
              {!props.portal?.toolbar && renderActions()}
            </Row>
          </Card.Header>
        )}

        {/* Portals */}
        {Boolean(props.portal?.refresh) &&
          createPortal(
            <TableRefreshButton {...props} />,
            props.portal?.refresh,
          )}
        {Boolean(props.portal?.toolbar) &&
          createPortal(renderActions(), props.portal.toolbar)}

        {/* Tabs */}
        {props.tabs?.length ? (
          <Card.Header className="table-tabs border-bottom align-items-stretch py-0 min-h-auto">
            <TableTabs tabs={props.tabs} />
          </Card.Header>
        ) : null}

        {props.filterPosition === 'header' && props.filters ? (
          <Card.Header className="table-filter border-bottom align-items-stretch">
            <TableFilterContainer filters={props.filters} />
          </Card.Header>
        ) : null}

        {props.filters
          ? (props.filterPosition === 'menu' ||
              (props.filterPosition === 'sidebar' &&
                props.filtersStorage.length > 0)) && (
              <Card.Header
                className={classNames('border-bottom', {
                  'd-none':
                    !showFilterMenuToggle && props.filterPosition === 'menu',
                })}
              >
                <TableFilters
                  table={props.table}
                  filtersStorage={props.filtersStorage}
                  filters={props.filters}
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

        <Card.Body>
          <div
            ref={tableResponsiveRef}
            className="table-responsive dataTables_wrapper"
            style={{ minHeight: props.minHeight || 300 }}
            onScroll={debouncedScrollHandler}
          >
            <div
              className={classNames(
                'table-container',
                tableHover && 'table-hover-shadow',
                gridHover && 'grid-hover-shadow',
              )}
            >
              {renderBody()}
            </div>
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
      renderFiltersDrawer(filters);
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
