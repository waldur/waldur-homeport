import { FunctionComponent } from 'react';

import { TableProps } from '@waldur/table/Table';

export const LoadingSpinner: FunctionComponent = () => (
  <button className="btn btn-icon btn-flush">
    <i className="fa fa-refresh fa-spin fs-4" />
  </button>
);

export const TableRefreshButton = (props: TableProps) =>
  (props.loading && props.sorting && !props.sorting.loading) ||
  (props.sorting && props.sorting.loading) ? (
    <LoadingSpinner />
  ) : (
    <button
      className="btn btn-icon btn-active-light-dark"
      onClick={props.fetch}
    >
      <i className="fa fa-refresh fs-4"></i>
    </button>
  );
