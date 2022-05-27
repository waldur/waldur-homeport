import React from 'react';
import { Button, Card, Col, Row } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { TranslateProps } from '@waldur/i18n/types';

import './Table.scss';
import { TableBody } from './TableBody';
import { TableButtons } from './TableButtons';
import { TableHeader } from './TableHeader';
import { TablePageSize } from './TablePageSize';
import { TablePagination } from './TablePagination';
import { TablePlaceholder } from './TablePlaceholder';
import { TableQuery } from './TableQuery';
import { TableRefreshButton } from './TableRefreshButton';
import { Column, TableState, Sorting } from './types';

export interface TableProps<RowType = any> extends TranslateProps, TableState {
  rows: any[];
  fetch: () => void;
  gotoPage?: (page: number) => void;
  hasQuery?: boolean;
  setQuery?: (query: string) => void;
  columns?: Array<Column<RowType>>;
  exportAs?: (format: string) => void;
  actions?: React.ReactNode;
  verboseName?: string;
  showPageSizeSelector?: boolean;
  updatePageSize?: (size: number) => void;
  resetPagination?: () => void;
  sortList?(sorting: Sorting): void;
  initialSorting?: Sorting;
  expandableRow?: React.ComponentType<{ row: any }>;
  toggleRow?(row: any): void;
  toggleFilter?(): void;
  toggled?: object;
  enableExport?: boolean;
  placeholderComponent?: React.ReactNode;
  filters?: React.ReactNode;
  title?: React.ReactNode;
  fullWidth?: boolean;
  hasActions?: boolean;
}

class Table<RowType = any> extends React.Component<TableProps<RowType>> {
  static defaultProps = {
    rows: [],
    columns: [],
    hasQuery: false,
    fullWidth: false,
    hasActions: true,
  };

  render() {
    return (
      <Card className={this.props.fullWidth ? 'full-width' : ''}>
        {this.props.title && (
          <Card.Header>
            <Card.Title>{this.props.title}</Card.Title>
          </Card.Header>
        )}
        {this.props.hasActions && (
          <Card.Header>
            {(this.props.hasQuery || this.props.filters) && (
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
                    <i className="fa fa-filter"></i> {translate('Filter')}
                  </Button>
                )}
              </Card.Title>
            )}
            {this.props.blocked && <div className="table-block" />}
            <div className="card-toolbar ms-auto">
              <div className="d-flex justify-content-end">
                <TableButtons {...this.props} />
              </div>
            </div>
          </Card.Header>
        )}
        <Card.Body>
          <div className="table-responsive dataTables_wrapper">
            {this.props.filterVisible && this.props.filters}
            <div className="table-container">{this.renderBody()}</div>
          </div>
          <Row>
            <Col
              sm={12}
              md={5}
              className="d-flex align-items-center justify-content-center justify-content-md-start"
            >
              {this.props.showPageSizeSelector && (
                <TablePageSize
                  {...this.props.pagination}
                  updatePageSize={this.props.updatePageSize}
                />
              )}
            </Col>
            <Col
              sm={12}
              md={7}
              className="d-flex align-items-center justify-content-center justify-content-md-end"
            >
              {this.hasRows() && (
                <TablePagination
                  {...this.props.pagination}
                  gotoPage={this.props.gotoPage}
                />
              )}
            </Col>
          </Row>
        </Card.Body>
      </Card>
    );
  }

  renderBody() {
    if (this.props.error) {
      return (
        <div>
          <p>{this.props.translate('Unable to fetch data.')}</p>
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
      <>
        <table className="table align-middle table-row-dashed fs-6 gy-5 dataTable no-footer">
          <TableHeader
            onSortClick={this.props.sortList}
            currentSorting={this.props.sorting}
            columns={this.props.columns}
            expandableRow={!!this.props.expandableRow}
          />
          <TableBody
            rows={this.props.rows}
            columns={this.props.columns}
            expandableRow={this.props.expandableRow}
            toggleRow={this.props.toggleRow}
            toggled={this.props.toggled}
          />
        </table>
      </>
    );
  }

  componentDidMount() {
    if (this.props.initialSorting) {
      this.props.sortList(this.props.initialSorting);
    } else {
      this.props.fetch();
    }
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
}

export default Table;
