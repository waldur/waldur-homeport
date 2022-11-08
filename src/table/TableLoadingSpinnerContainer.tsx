import { FunctionComponent } from 'react';

import { TableProps } from '@waldur/table/Table';

export const LoadingSpinner: FunctionComponent = () => (
  <span>
    <i className="fa fa-spinner fa-spin" />
  </span>
);

export const TableLoadingSpinnerContainer = (props: TableProps) =>
  (props.loading && props.sorting && !props.sorting.loading) ||
  (props.sorting && props.sorting.loading) ? (
    <LoadingSpinner />
  ) : null;
