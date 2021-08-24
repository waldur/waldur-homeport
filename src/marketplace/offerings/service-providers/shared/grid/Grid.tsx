import React from 'react';

import './Grid.scss';
import { TranslateProps } from '@waldur/i18n/types';
import { GridPagination } from '@waldur/marketplace/offerings/service-providers/shared/grid/GridPagination';
import { TablePlaceholder } from '@waldur/table/TablePlaceholder';
import { TableState } from '@waldur/table/types';

import { GridBody } from './GridBody';
import { GridButtons } from './GridButtons';
import { GridInfo } from './GridInfo';
import { GridQuery } from './GridQuery';
import { GridRefreshButton } from './GridRefreshButton';

interface GridProps extends TranslateProps, TableState {
  rows: any[];
  fetch: () => void;
  gotoPage?: (page: number) => void;
  hasQuery?: boolean;
  queryPlaceholder?: string;
  setQuery?: (query: string) => void;
  verboseName?: string;
  resetPagination?: () => void;
  gridItemComponent: React.ComponentType<{ row: any }>;
  placeholderComponent?: React.ReactNode;
}

class Grid extends React.Component<GridProps> {
  static defaultProps = {
    rows: [],
    hasQuery: false,
  };

  render() {
    return (
      <div className="grid">
        <div className="grid__header">
          <div>
            {this.props.hasQuery && (
              <GridQuery
                query={this.props.query}
                placeholder={this.props.queryPlaceholder}
                setQuery={this.props.setQuery}
              />
            )}
          </div>
          <div className="grid__header__actions">
            {this.hasRows() && <GridInfo {...this.props.pagination} />}
            <GridButtons {...this.props} />
          </div>
        </div>
        {this.renderBody()}
        {this.hasRows() && (
          <GridPagination
            {...this.props.pagination}
            gotoPage={this.props.gotoPage}
          />
        )}
      </div>
    );
  }

  renderBody() {
    if (this.props.error) {
      return (
        <div>
          <p>{this.props.translate('Unable to fetch data.')}</p>
          <GridRefreshButton {...this.props} />
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
      <GridBody
        rows={this.props.rows}
        gridItemComponent={this.props.gridItemComponent}
      />
    );
  }

  componentDidMount() {
    this.props.fetch();
  }

  componentDidUpdate(prevProps: GridProps) {
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
    }
  }

  hasRows() {
    return this.props.rows && this.props.rows.length > 0;
  }
}

export default Grid;
