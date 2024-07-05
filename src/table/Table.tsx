import { ErrorBoundary } from '@sentry/react';
import classNames from 'classnames';
import React, { useEffect, useMemo } from 'react';
import { Button, Card, Col, ColProps, Row, Stack } from 'react-bootstrap';
import { BaseFieldProps } from 'redux-form';

import { titleCase } from '@waldur/core/utils';
import { ErrorMessage } from '@waldur/ErrorMessage';
import { translate } from '@waldur/i18n';
import { ErrorView } from '@waldur/navigation/header/search/ErrorView';

import { OPTIONAL_COLUMN_ACTIONS_KEY } from './constants';
import { GridBody } from './GridBody';
import './Table.scss';
import { HiddenActionsMessage } from './HiddenActionsMessage';
import { TableBody } from './TableBody';
import { TableButtons } from './TableButtons';
import { TableFilterContainer } from './TableFilterContainer';
import { TableFilters } from './TableFilters';
import { TableHeader } from './TableHeader';
import { TableLoadingSpinnerContainer } from './TableLoadingSpinnerContainer';
import { TablePageSize } from './TablePageSize';
import { TablePagination } from './TablePagination';
import { TablePlaceholder } from './TablePlaceholder';
import { TableQuery } from './TableQuery';
import { TableRefreshButton } from './TableRefreshButton';
import {
  Column,
  DisplayMode,
  ExportConfig,
  Sorting,
  TableDropdownItem,
  TableState,
} from './types';

export interface TableProps<RowType = any> extends TableState {
  rows: any[];
  fetch: () => void;
  gotoPage?: (page: number) => void;
  hasQuery?: boolean;
  setQuery?: (query: string) => void;
  columns?: Array<Column<RowType>>;
  setDisplayMode?: (mode: DisplayMode) => void;
  gridItem?: React.ComponentType<{ row: RowType }>;
  gridSize?: ColProps;
  openExportDialog?: (format: ExportConfig['format'], props?) => void;
  openFiltersDrawer?: (filters: React.ReactNode) => void;
  renderFiltersDrawer?: (filters: React.ReactNode) => void;
  dropdownActions?: TableDropdownItem[];
  actions?: React.ReactNode;
  verboseName?: string;
  className?: string;
  id?: string;
  rowClass?: (({ row }) => string) | string;
  hoverable?: boolean;
  showPageSizeSelector?: boolean;
  updatePageSize?: (size: number) => void;
  initialPageSize?: number;
  resetPagination?: () => void;
  hasPagination?: boolean;
  sortList?(sorting: Sorting): void;
  initialSorting?: Sorting;
  expandableRow?: React.ComponentType<{ row: any }>;
  expandableRowClassName?: string;
  hoverableRow?: React.ComponentType<{ row; fetch }>;
  toggleRow?(row: any): void;
  toggled?: Record<string, boolean>;
  enableExport?: boolean;
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
  toggleColumn?(index, column, value?): void;
  initialMode?: 'grid' | 'table';
  standalone?: boolean;
  hideClearFilters?: boolean;
}

const TableComponent = (props: TableProps) => {
  const visibleColumns = useMemo(
    () =>
      props.hasOptionalColumns
        ? props.columns.filter(
            (column, index) => !column.keys || props.activeColumns[index],
          )
        : props.columns,
    [props.activeColumns, props.columns],
  );

  const showActions = useMemo(() => {
    if (props.hoverableRow && !props.hasOptionalColumns) return true;
    return Boolean(props.activeColumns[OPTIONAL_COLUMN_ACTIONS_KEY]);
  }, [props.hoverableRow, props.hasOptionalColumns, props.activeColumns]);

  return (
    <table
      className={classNames(
        'table align-middle table-row-dashed fs-6 gy-5 dataTable no-footer',
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
        />
      )}
      <TableBody
        rows={props.rows}
        columns={visibleColumns}
        rowClass={props.rowClass}
        expandableRow={props.expandableRow}
        expandableRowClassName={props.expandableRowClassName}
        hoverableRow={showActions ? props.hoverableRow : undefined}
        enableMultiSelect={props.enableMultiSelect}
        selectRow={props.selectRow}
        selectedRows={props.selectedRows}
        toggleRow={props.toggleRow}
        toggled={props.toggled}
        fetch={props.fetch}
        fieldType={props.fieldType}
        fieldName={props.fieldName}
        validate={props.validate}
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
  };

  render() {
    return (
      <>
        {this.props.standalone && (
          <div className="d-flex justify-content-between gap-4 mb-7">
            <Stack direction="horizontal" gap={2}>
              <h1 className="mb-0">
                {this.props.title || this.props.alterTitle}
              </h1>
              <TableRefreshButton {...this.props} />
            </Stack>
            <div>{this.props.actions}</div>
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
              <Row className="card-toolbar w-100">
                {!this.props.standalone && (
                  <Col xs className="order-0 mw-25 pe-5">
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
                <Col
                  xs="auto"
                  className="order-1 order-md-2 min-w-25 ms-auto ps-5"
                >
                  {this.showActionsColumn() && (
                    <div className="d-flex justify-content-end text-nowrap gap-3">
                      <TableButtons {...this.props} />
                    </div>
                  )}
                </Col>
                {this.showQueryColumn() && (
                  <Col
                    xs
                    className={classNames(
                      'order-2 order-md-1 mw-lg-350px',
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

          {this.props.filterPosition === 'sidebar' &&
          this.props.filtersStorage.length &&
          this.props.filters ? (
            <Card.Header className="border-2 border-bottom">
              <TableFilters
                filtersStorage={this.props.filtersStorage}
                filters={this.props.filters}
                renderFiltersDrawer={this.props.renderFiltersDrawer}
                hideClearFilters={this.props.hideClearFilters}
              />
            </Card.Header>
          ) : null}

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
            <div className="table-responsive dataTables_wrapper">
              <div className={classNames('table-container table-hover-shadow')}>
                {this.renderBody()}
              </div>
            </div>
            {this.props.hasPagination && (
              <Row className="table-pagination px-0">
                <Col
                  sm="auto"
                  md={2}
                  className="d-flex align-items-start justify-content-start"
                >
                  {this.props.showPageSizeSelector && (
                    <TablePageSize
                      {...this.props.pagination}
                      updatePageSize={this.props.updatePageSize}
                    />
                  )}
                </Col>
                <Col
                  sm
                  md={8}
                  className="d-flex flex-column align-items-end justify-content-start align-items-md-center"
                >
                  {this.hasRows() && (
                    <TablePagination
                      {...this.props.pagination}
                      gotoPage={this.props.gotoPage}
                    />
                  )}
                </Col>
              </Row>
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
      this.props.actions ||
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
    filterPosition,
    applyFilters,
    filters,
    firstFetch,
    renderFiltersDrawer,
    hasOptionalColumns,
    columns,
    toggleColumn,
    hoverableRow,
  } = props;

  useEffect(() => {
    // We need to render the filters at the beginning to read the initial filters
    if (filterPosition === 'sidebar' && firstFetch) {
      renderFiltersDrawer(filters);
    }
  }, []);

  useEffect(() => {
    if (filterPosition === 'header' || applyFilters) {
      fetch();
    }
  }, [fetch, filterPosition, applyFilters]);

  useEffect(() => {
    if (columns?.length && hasOptionalColumns) {
      columns.forEach((column, index) => {
        toggleColumn(index, column, column.optional ? false : true);
      });
      // Add actions column to the optional columns
      if (hoverableRow) {
        toggleColumn(OPTIONAL_COLUMN_ACTIONS_KEY, { keys: [] }, true);
      }
    }
  }, []);

  return <TableClass {...props} />;
}
