import { ErrorBoundary } from '@sentry/react';
import classNames from 'classnames';
import React, { useEffect } from 'react';
import { Button, Card, Col, ColProps, Row, Stack } from 'react-bootstrap';
import { BaseFieldProps } from 'redux-form';

import { ErrorMessage } from '@waldur/ErrorMessage';
import { translate } from '@waldur/i18n';

import './Table.scss';
import { GridBody } from './GridBody';
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
  TableState,
  Sorting,
  TableDropdownItem,
  ExportConfig,
  DisplayMode,
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
  fullWidth?: boolean;
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
  toggleColumn?(column): void;
  initialMode?: 'grid' | 'table';
  standalone?: boolean;
}

class TableClass<RowType = any> extends React.Component<TableProps<RowType>> {
  static defaultProps = {
    rows: [],
    columns: [],
    hasQuery: false,
    fullWidth: false,
    hasPagination: true,
    hasActionBar: true,
    hasHeaders: true,
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
            this.props.fullWidth ? 'full-width' : '',
            this.props.fieldName ? 'field-table' : '',
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
                        {this.props.title || this.props.alterTitle}
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
              />
            </Card.Header>
          ) : null}

          <Card.Body>
            <div className="table-responsive dataTables_wrapper">
              <div
                className={classNames(
                  'table-container',
                  this.props.mode === 'grid' && this.props.gridItem && 'px-3',
                )}
              >
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
      return (
        <div className="text-center mt-4">
          <p>{translate('Unable to fetch data.')}</p>
          <TableRefreshButton {...this.props} />
        </div>
      );
    }

    if (!this.props.loading && !this.hasRows()) {
      if (this.props.placeholderComponent) {
        return this.props.placeholderComponent;
      } else {
        const { query, verboseName } = this.props;
        return <TablePlaceholder {...{ query, verboseName }} />;
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
        <table
          className={classNames(
            'table align-middle table-row-dashed fs-6 gy-5 dataTable no-footer',
            {
              'table-expandable': Boolean(this.props.expandableRow),
              'table-hover': this.props.hoverable,
            },
          )}
        >
          {this.props.hasHeaders && (
            <TableHeader
              rows={this.props.rows}
              onSortClick={this.props.sortList}
              currentSorting={this.props.sorting}
              columns={this.props.columns}
              expandableRow={!!this.props.expandableRow}
              enableMultiSelect={this.props.enableMultiSelect}
              onSelectAllRows={this.props.selectAllRows}
              selectedRows={this.props.selectedRows}
              fieldType={this.props.fieldType}
              concealedColumns={this.props.concealedColumns}
            />
          )}
          <TableBody
            rows={this.props.rows}
            columns={this.props.columns}
            rowClass={this.props.rowClass}
            expandableRow={this.props.expandableRow}
            expandableRowClassName={this.props.expandableRowClassName}
            hoverableRow={this.props.hoverableRow}
            enableMultiSelect={this.props.enableMultiSelect}
            selectRow={this.props.selectRow}
            selectedRows={this.props.selectedRows}
            toggleRow={this.props.toggleRow}
            toggled={this.props.toggled}
            fetch={this.props.fetch}
            fieldType={this.props.fieldType}
            fieldName={this.props.fieldName}
            validate={this.props.validate}
            concealedColumns={this.props.concealedColumns}
          />
        </table>
      </ErrorBoundary>
    );
  }

  componentDidMount() {
    if (this.props.initialMode) {
      this.props.setDisplayMode(this.props.initialMode);
    }
    const doFetch = !this.props.initialPageSize && !this.props.initialSorting;
    if (this.props.firstFetch && this.props.initialPageSize) {
      this.props.updatePageSize(this.props.initialPageSize);
    }
    if (this.props.firstFetch && this.props.initialSorting) {
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

  return <TableClass {...props} />;
}
