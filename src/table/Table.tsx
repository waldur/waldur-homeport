import { ErrorBoundary } from '@sentry/react';
import classNames from 'classnames';
import React, { useEffect } from 'react';
import { Button, Card, Col, Row } from 'react-bootstrap';

import { ErrorMessage } from '@waldur/ErrorMessage';
import { translate } from '@waldur/i18n';

import './Table.scss';
import { TableBody } from './TableBody';
import { TableButtons } from './TableButtons';
import { TableFilter } from './TableFilter';
import { TableHeader } from './TableHeader';
import { TableLoadingSpinnerContainer } from './TableLoadingSpinnerContainer';
import { TablePageSize } from './TablePageSize';
import { TablePagination } from './TablePagination';
import { TablePlaceholder } from './TablePlaceholder';
import { TableQuery } from './TableQuery';
import { TableRefreshButton } from './TableRefreshButton';
import { Column, TableState, Sorting, TableDropdownItem } from './types';

export interface TableProps<RowType = any> extends TableState {
  rows: any[];
  fetch: () => void;
  gotoPage?: (page: number) => void;
  hasQuery?: boolean;
  setQuery?: (query: string) => void;
  columns?: Array<Column<RowType>>;
  exportAs?: (format: string) => void;
  dropdownActions?: TableDropdownItem[];
  actions?: React.ReactNode;
  verboseName?: string;
  className?: string;
  rowClass?: (({ row }) => string) | string;
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
  toggleFilter?(): void;
  toggled?: object;
  enableExport?: boolean;
  placeholderComponent?: React.ReactNode;
  filters?: React.ReactNode;
  title?: React.ReactNode;
  alterTitle?: React.ReactNode;
  hasActionBar?: boolean;
  hasHeaders?: boolean;
  fullWidth?: boolean;
  enableMultiSelect?: boolean;
  multiSelectActions?: React.ComponentType<{ rows: any[] }>;
  selectRow?(row: any): void;
  selectAllRows?(rows: any[]): void;
  filter?: Record<string, any>;
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
      <Card
        className={classNames(
          'card-table',
          this.props.fullWidth ? 'full-width' : '',
          this.props.className,
        )}
      >
        {this.props.blocked && <div className="table-block" />}
        {this.props.hasActionBar && (
          <Card.Header className="border-2 border-bottom">
            <Row className="card-toolbar w-100">
              <Col xs className="order-0 pe-5">
                <Card.Title>
                  <span className="me-2">
                    {this.props.title || this.props.alterTitle}
                  </span>
                  <TableRefreshButton {...this.props} />
                </Card.Title>
              </Col>
              <Col xs md={4} xl={4} className="order-1 order-md-2 ps-5">
                {this.showActionsColumn() && (
                  <div className="ms-auto">
                    <div className="d-flex justify-content-end text-nowrap">
                      <TableButtons {...this.props} />
                    </div>
                  </div>
                )}
              </Col>
              {this.showQueryColumn() && (
                <Col
                  xs={12}
                  md={4}
                  xl={4}
                  className="order-2 order-md-1 mt-4 mt-md-0"
                >
                  {!this.props.selectedRows?.length ? (
                    this.props.hasQuery && (
                      <TableQuery
                        query={this.props.query}
                        setQuery={this.props.setQuery}
                      />
                    )
                  ) : (
                    <span className="me-2 border-bottom-dashed border-2">
                      {translate('{count} rows selected', {
                        count: this.props.selectedRows?.length,
                      })}
                    </span>
                  )}
                </Col>
              )}
            </Row>
          </Card.Header>
        )}

        {this.props.filterVisible && this.props.filters && (
          <Card.Header className="table-filter border-2 border-bottom align-items-stretch">
            <TableFilter filters={this.props.filters} />
          </Card.Header>
        )}

        <Card.Body>
          <div className="table-responsive dataTables_wrapper">
            <div className="table-container">{this.renderBody()}</div>
          </div>
          {this.props.hasPagination && (
            <Row className="table-pagination">
              <Col
                sm={'auto'}
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
        </Card.Body>
      </Card>
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

    return (
      <ErrorBoundary fallback={ErrorMessage}>
        <table
          className={classNames(
            'table align-middle table-row-dashed fs-6 gy-5 dataTable no-footer',
            this.props.expandableRow ? 'table-expandable' : '',
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
          />
        </table>
      </ErrorBoundary>
    );
  }

  renderQueryAndFilter() {
    return (
      <Card.Title>
        {this.props.hasQuery && (
          <div className="me-3">
            <TableQuery
              query={this.props.query}
              setQuery={this.props.setQuery}
            />
          </div>
        )}
        {this.props.filters && (
          <Button variant="light" onClick={this.props.toggleFilter}>
            <i className="fa fa-filter" /> {translate('Filter')}
          </Button>
        )}
      </Card.Title>
    );
  }

  componentDidMount() {
    const doFetch = !this.props.initialPageSize && !this.props.initialSorting;
    if (this.props.initialPageSize) {
      this.props.updatePageSize(this.props.initialPageSize);
    }
    if (this.props.initialSorting) {
      this.props.sortList(this.props.initialSorting);
    }
    if (this.props.loading || this.props.rows.length || this.props.error) {
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
      this.props.enableExport
    );
  }
}

export default function Table<RowType = any>(props: TableProps<RowType>) {
  const { fetch, filter } = props;
  useEffect(() => {
    fetch();
  }, [fetch, filter]);

  return <TableClass {...props} />;
}
