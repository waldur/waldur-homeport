import { FunctionComponent } from 'react';

import './TableLoadingSpinner.scss';
import { TableProps } from '@waldur/table/Table';

export const LoadingSpinner: FunctionComponent = () => (
  <h3 className="spinner-container">
    <i className="fa fa-spinner fa-spin" />
  </h3>
);

export const TableLoadingSpinnerContainer = (props: TableProps) =>
  (props.loading && props.sorting && !props.sorting.loading) ||
  (props.sorting && props.sorting.loading) ? (
    <LoadingSpinner />
  ) : null;
