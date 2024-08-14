import { ErrorBoundary } from '@sentry/react';
import classNames from 'classnames';
import React, { useEffect, useMemo, useRef } from 'react';
import { Button, Card, Col, ColProps, Row, Stack } from 'react-bootstrap';
import { useMediaQuery } from 'react-responsive';
import { BaseFieldProps } from 'redux-form';

import { GRID_BREAKPOINTS } from '@waldur/core/constants';
import { titleCase } from '@waldur/core/utils';
import { ErrorMessage } from '@waldur/ErrorMessage';
import { translate } from '@waldur/i18n';
import { ErrorView } from '@waldur/navigation/header/search/ErrorView';

import { OPTIONAL_COLUMN_ACTIONS_KEY } from './constants';
import { GridBody } from './GridBody';
import { HiddenActionsMessage } from './HiddenActionsMessage';
import './Table.scss';
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
import {
  Column,
  DisplayMode,
  ExportConfig,
  FilterItem,
  FilterPosition,
  Sorting,
  TableDropdownItem,
  TableState,
} from './types';

export interface TableProps<RowType = any> extends TableState {
  table?: string;
  rows: any[];
  fetch: () => void;
  gotoPage?: (page: number) => void;
  hasQuery?: boolean;
  setQuery?: (query: string) => void;
  setFilter?: (item: FilterItem) => void;
  applyFiltersFn?: (apply: boolean) => void;
  setFilterPosition?: (filterPosition: FilterPosition) => void;
  columns?: Array<Column<RowType>>;
  setDisplayMode?: (mode: DisplayMode) => void;
  gridItem?: React.ComponentType<{ row: RowType }>;
  gridSize?: ColProps;
  openExportDialog?: (format: ExportConfig['format'], props?) => void;
  openFiltersDrawer?: (filters: React.ReactNode) => void;
  renderFiltersDrawer?: (filters: React.ReactNode) => void;
  dropdownActions?: TableDropdownItem[];
  tableActions?: React.ReactNode;
  verboseName?: string;
  className?: string;
  id?: string;
  rowClass?: (({ row }) => string) | string;
  hoverable?: boolean;
  minHeight?: number;
  showPageSizeSelector?: boolean;
  updatePageSize?: (size: number) => void;
  initialPageSize?: number;
  resetPagination?: () => void;
  hasPagination?: boolean;
  sortList?(sorting: Sorting): void;
  initialSorting?: Sorting;
  expandableRow?: React.ComponentType<{ row: any }>;
  expandableRowClassName?: string;
  rowActions?: React.ComponentType<{ row; fetch }>;
  toggleRow?(row: any): void;
  toggled?: Record<string, boolean>;
  enableExport?: boolean;
  showExportInDropdown?: boolean;
  placeholderComponent?: React.ReactNode;
  filters?: JSX.Element;
  title?: React.ReactNode;
  alterTitle?: React.ReactNode;
  hasActionBar?: boolean;
  hasHeaders?: boolean;
  enableMultiSelect?: boolean;
  multiSelectActions?: React.ComponentType<{ rows: any[]; refetch }>;
  selectRow?(row: any): void;
  selectAllRows?(rows: any[]): void;
  resetSelection?: () => void;
  filter?: Record<string, any>;
  fieldType?: 'checkbox' | 'radio';
  fieldName?: string;
  validate?: BaseFieldProps['validate'];
  footer?: React.ReactNode;
  hasOptionalColumns?: boolean;
  toggleColumn?(id, column, value?): void;
  initColumnPositions?(ids: string[]): void;
  swapColumns?(column1: string, column2: string): void;
  initialMode?: 'grid' | 'table';
  standalone?: boolean;
  hideClearFilters?: boolean;
}

const TableComponent = (props: TableProps) => {
  const visibleColumns = useMemo(
    () =>
      props.hasOptionalColumns
        ? props.columns.filter(
            (column) => !column.keys || props.activeColumns[column.id],
          )
        : props.columns,
    [props.activeColumns, props.columns],
  );

  const showActions = useMemo(() => {
    if (props.rowActions && !props.hasOptionalColumns) return true;
    return Boolean(props.activeColumns[OPTIONAL_COLUMN_ACTIONS_KEY]);
  }, [props.rowActions, props.hasOptionalColumns, props.activeColumns]);

  return (
    <table
      className={classNames(
        'table align-middle table-row-bordered fs-6 gy-5 dataTable no-footer',
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
          fieldType={props.fieldType}
          filters={props.filters}
          setFilter={props.setFilter}
          applyFiltersFn={props.applyFiltersFn}
          columnPositions={props.columnPositions}
          hasOptionalColumns={props.hasOptionalColumns}
        />
      )}
      <TableBody
        rows={props.rows}
        columns={visibleColumns}
        rowClass={props.rowClass}
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
      />
    </table>
  );
};

class TableClass<RowType = any> extends React.Component<TableProps<RowType>> {
  static defaultProps = {
    rows: [],
    columns: [],
    hasQuery: false,
    hasPagination: true,
    hasActionBar: true,
    hasHeaders: true,
  };

  state = {
    closedHiddenActionsMessage: false,
    /** Controls whether the add filter toggle is displayed, \
     * but only if we don't have an active filter. Otherwise, it has no effect. \
     * Used with `filterPosition = 'menu'`*/
    showFilterMenuToggle: false,
  };

  render() {
    return (
      <>
        {this.props.standalone && (
          <div className="d-flex justify-content-between gap-4 mb-6">
            <Stack direction="horizontal" gap={2}>
              <h1 className="mb-0">
                {this.props.title || this.props.alterTitle}
              </h1>
              <TableRefreshButton {...this.props} />
            </Stack>
            <div className="d-none d-sm-flex gap-3">
              {this.props.tableActions}
            </div>
          </div>
        )}
        <Card
          className={classNames(
            'card-table',
            'full-width',
            this.props.fieldName ? 'field-table' : '',
            this.props.mode === 'grid' &&
              Boolean(this.props.gridItem) &&
              'grid-table',
            this.props.className,
          )}
          id={this.props.id}
        >
          {this.props.blocked && <div className="table-block" />}
          {this.props.hasActionBar && (
            <Card.Header className="border-2 border-bottom">
              <Row className="card-toolbar g-0 gap-4 w-100">
                {!this.props.standalone && (
                  <Col xs className="order-0 mw-sm-25">
                    <Card.Title>
                      <span className="me-2">
                        {this.props.title ||
                          (this.props.verboseName &&
                            titleCase(this.props.verboseName)) ||
                          this.props.alterTitle}
                      </span>
                      <TableRefreshButton {...this.props} />
                    </Card.Title>
                  </Col>
                )}
                <Col sm="auto" className="order-1 order-sm-2 min-w-25 ms-auto">
                  {this.showActionsColumn() && (
                    <div className="d-flex justify-content-sm-end flex-wrap flex-sm-nowrap text-nowrap gap-3">
                      <TableButtons
                        {...this.props}
                        showFilterMenuToggle={this.state.showFilterMenuToggle}
                        toggleFilterMenu={() =>
                          this.setState({
                            showFilterMenuToggle:
                              !this.state.showFilterMenuToggle,
                          })
                        }
                      />
                    </div>
                  )}
                </Col>
                {this.showQueryColumn() && (
                  <Col
                    xs={!this.showActionsColumn()}
                    sm={Boolean(this.showActionsColumn())}
                    className={classNames(
                      'order-2 order-sm-1 mw-lg-350px',
                      !this.props.standalone && 'mx-auto',
                    )}
                  >
                    {!this.props.selectedRows?.length ? (
                      this.props.hasQuery && (
                        <TableQuery
                          query={this.props.query}
                          setQuery={this.props.setQuery}
                        />
                      )
                    ) : (
                      <>
                        <Button
                          variant="light"
                          className="btn-icon me-2"
                          size="sm"
                          onClick={this.props.resetSelection}
                        >
                          <i className="fa fa-times fs-5" />
                        </Button>
                        <span className="me-2 border-bottom-dashed border-2">
                          {this.props.selectedRows?.length === 1
                            ? translate('{count} row selected', {
                                count: this.props.selectedRows?.length,
                              })
                            : translate('{count} rows selected', {
                                count: this.props.selectedRows?.length,
                              })}
                        </span>
                      </>
                    )}
                  </Col>
                )}
              </Row>
            </Card.Header>
          )}

          {this.props.filterPosition === 'header' && this.props.filters ? (
            <Card.Header className="table-filter border-2 border-bottom align-items-stretch">
              <TableFilterContainer filters={this.props.filters} />
            </Card.Header>
          ) : null}

          {this.props.filters
            ? (this.props.filterPosition === 'menu' ||
                (this.props.filterPosition === 'sidebar' &&
                  this.props.filtersStorage.length > 0)) && (
                <Card.Header
                  className={classNames('border-2 border-bottom', {
                    'd-none':
                      !this.state.showFilterMenuToggle &&
                      this.props.filterPosition === 'menu' &&
                      !this.props.filtersStorage.length,
                  })}
                >
                  <TableFilters
                    table={this.props.table}
                    filtersStorage={this.props.filtersStorage}
                    filters={this.props.filters}
                    renderFiltersDrawer={this.props.renderFiltersDrawer}
                    hideClearFilters={this.props.hideClearFilters}
                    filterPosition={this.props.filterPosition}
                    setFilter={this.props.setFilter}
                    applyFiltersFn={this.props.applyFiltersFn}
                    selectedSavedFilter={this.props.selectedSavedFilter}
                  />
                </Card.Header>
              )
            : null}

          {!this.state.closedHiddenActionsMessage &&
            this.props.hasOptionalColumns &&
            this.props.activeColumns[OPTIONAL_COLUMN_ACTIONS_KEY] === false && (
              <Card.Header className="border-2 border-bottom">
                <HiddenActionsMessage
                  toggleColumn={this.props.toggleColumn}
                  close={() =>
                    this.setState({ closedHiddenActionsMessage: true })
                  }
                />
              </Card.Header>
            )}

          <Card.Body>
            <div
              className="table-responsive dataTables_wrapper"
              style={{ minHeight: this.props.minHeight }}
            >
              <div className={classNames('table-container table-hover-shadow')}>
                {this.renderBody()}
              </div>
            </div>
            {this.props.hasPagination && (
              <TablePagination
                {...this.props.pagination}
                hasRows={this.hasRows()}
                showPageSizeSelector={this.props.showPageSizeSelector}
                updatePageSize={this.props.updatePageSize}
                gotoPage={this.props.gotoPage}
              />
            )}
            {this.props.footer}
          </Card.Body>
        </Card>
      </>
    );
  }

  renderBody() {
    if (this.props.loading && !this.hasRows()) {
      return (
        <h1 className="text-center">
          <TableLoadingSpinnerContainer {...this.props} />
        </h1>
      );
    }

    if (this.props.error) {
      return <ErrorView />;
    }

    if (!this.props.loading && !this.hasRows()) {
      if (this.props.placeholderComponent) {
        return this.props.placeholderComponent;
      } else {
        const { query, verboseName, setQuery } = this.props;
        return (
          <TablePlaceholder
            query={query}
            verboseName={verboseName}
            clearSearch={() => setQuery('')}
            fetch={this.props.fetch}
          />
        );
      }
    }

    return this.props.mode === 'grid' && this.props.gridItem ? (
      <ErrorBoundary fallback={ErrorMessage}>
        <GridBody
          rows={this.props.rows}
          gridItem={this.props.gridItem}
          gridSize={this.props.gridSize}
        />
      </ErrorBoundary>
    ) : (
      <ErrorBoundary fallback={ErrorMessage}>
        <TableComponent {...this.props} />
      </ErrorBoundary>
    );
  }

  componentDidMount() {
    if (this.props.initialMode) {
      this.props.setDisplayMode(this.props.initialMode);
    }
    const doFetch = !this.props.initialPageSize && !this.props.initialSorting;
    if (this.props.initialPageSize) {
      this.props.updatePageSize(this.props.initialPageSize);
    }
    if (this.props.initialSorting) {
      this.props.sortList(this.props.initialSorting);
    }
    if (
      this.props.loading ||
      this.props.rows.length ||
      this.props.error ||
      !this.props.firstFetch
    ) {
      return;
    }
    doFetch && this.props.fetch();
  }

  componentDidUpdate(prevProps: TableProps) {
    if (
      prevProps.pagination.currentPage !== this.props.pagination.currentPage
    ) {
      this.props.fetch();
    } else if (
      prevProps.pagination.pageSize !== this.props.pagination.pageSize
    ) {
      if (
        this.props.pagination.pageSize * this.props.pagination.currentPage >=
        this.props.pagination.resultCount
      ) {
        this.props.resetPagination();
      }
      this.props.fetch();
    } else if (prevProps.query !== this.props.query) {
      this.props.resetPagination();
      this.props.fetch();
    } else if (
      prevProps.sorting !== this.props.sorting &&
      this.props.sorting.loading
    ) {
      this.props.fetch();
    }
  }

  componentWillUnmount() {
    this.props.resetSelection();
  }

  hasRows() {
    return this.props.rows && this.props.rows.length > 0;
  }

  showQueryColumn() {
    return (
      (this.props.enableMultiSelect && this.props.selectedRows?.length) ||
      this.props.hasQuery
    );
  }
  showActionsColumn() {
    return (
      (this.props.enableMultiSelect && this.props.multiSelectActions) ||
      this.props.tableActions ||
      this.props.dropdownActions?.length ||
      this.props.enableExport ||
      this.props.filters ||
      Boolean(this.props.gridItem && this.props.columns.length)
    );
  }
}

export default function Table<RowType = any>(props: TableProps<RowType>) {
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

  useEffect(() => {
    setFilterPosition(originalFilterPosition);
  }, []);

  useEffect(() => {
    // We need to render the filters at the beginning to read the initial filters
    if (filterPosition === 'sidebar') {
      renderFiltersDrawer(filters);
    } else if (filterPosition === 'menu') {
      applyFiltersFn(true);
    }
  }, []);

  useEffect(() => {
    if (filterPosition === 'header' || applyFilters) {
      fetch();
    }
  }, [fetch, filterPosition, applyFilters]);

  useEffect(() => {
    if (columns?.length && hasOptionalColumns) {
      columns.forEach((column) => {
        toggleColumn(column.id, column, column.optional ? false : true);
      });
      // Add actions column to the optional columns
      if (rowActions) {
        toggleColumn(OPTIONAL_COLUMN_ACTIONS_KEY, { keys: [] }, true);
      }
    }
  }, []);

  // Refetch the table if a column is added (Compare with the previous keys that were fetched)
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
  }, [activeColumns, prevActiveCols]);

  useEffect(() => {
    if (columns?.length) {
      initColumnPositions(columns.map((column) => column.id));
    }
  }, []);

  return <TableClass {...props} filterPosition={filterPosition} />;
}
