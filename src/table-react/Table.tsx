import * as React from 'react';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { TranslateProps } from '@waldur/i18n/types';

import FallbackTablePlaceholder from './placeholder/FallbackTablePlaceholder';
import { TablePlaceholderProps } from './placeholder/TablePlaceholder';
import './Table.scss';
import { TableBody } from './TableBody';
import TableButtons from './TableButtons';
import { TableHeader } from './TableHeader';
import TableInfo from './TableInfo';
import { TablePageSize } from './TablePageSize';
import TablePagination from './TablePagination';
import TableQuery from './TableQuery';
import TableRefreshButton from './TableRefreshButton';
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
  expandableRow?: React.ComponentType<{row: any}>;
  toggleRow?(row: any): void;
  toggled?: object;
  enableExport?: boolean;
  placeholderComponent?: React.ComponentType<TablePlaceholderProps>;
}

class Table extends React.Component<TableProps> {
  static defaultProps = {
    rows: [],
    columns: [],
    hasQuery: false,
  };

  render() {
    const TableControls = (props: TableProps) => (
      <>
        <TableButtons {...props}/>
          {props.hasQuery && (
            <TableQuery
              query={props.query}
              setQuery={props.setQuery}
              translate={props.translate}/>
          )}
          {props.showPageSizeSelector &&
            <TablePageSize
              translate={props.translate}
              pageSize={props.pagination.pageSize}
              updatePageSize={props.updatePageSize}
            />
          }
          <TableInfo {...props.pagination} translate={props.translate}/>
      </>
    );

    return (
      <div className="table-responsive dataTables_wrapper">
        {this.props.blocked && <div className="table-block"/>}
        {this.hasRows() && <TableControls {...this.props} />}
        {this.renderBody()}
        {
          this.hasRows() &&
          <TablePagination
            {...this.props.pagination}
            gotoPage={this.props.gotoPage}
            translate={this.props.translate}/>
        }
      </div>
    );
  }

  renderBody() {
    if (this.props.loading && (this.props.sorting && !this.props.sorting.loading)) {
      return <LoadingSpinner/>;
    }

    if (this.props.error) {
      return (
        <div>
          <p>{this.props.translate('Unable to fetch data.')}</p>
          <TableRefreshButton {...this.props}/>
        </div>
      );
    }

    if (!this.props.loading && !this.hasRows()) {
      const { placeholderComponent } = this.props;
      if (placeholderComponent) {
        return placeholderComponent;
      } else {
        const { query, verboseName, translate } = this.props;
        return (<FallbackTablePlaceholder {...{query, verboseName, translate}} />);
      }
    }

    return (
      <>
        {(this.props.sorting && this.props.sorting.loading) && (
          <>
            <div className="blocking-layer">
              <LoadingSpinner/>
            </div>
          </>
        )}
        <table className="table table-striped dataTable">
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
    } else if (!this.props.loading) {
      this.props.fetch();
    }
  }

  componentWillUnmount() {
    this.props.resetPagination();
  }

  componentDidUpdate(prevProps: TableProps) {
    if (prevProps.pagination.currentPage !== this.props.pagination.currentPage) {
      this.props.fetch();
    } else if (prevProps.pagination.pageSize !== this.props.pagination.pageSize) {
      this.props.fetch();
    } else if (prevProps.query !== this.props.query) {
      this.props.resetPagination();
      this.props.fetch();
    } else if (prevProps.sorting !== this.props.sorting && this.props.sorting.loading) {
      this.props.fetch();
    }
  }

  hasRows() {
    return this.props.rows && this.props.rows.length > 0;
  }
}

export default Table;
