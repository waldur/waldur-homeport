import { LoadingSpinnerIcon } from '@waldur/core/LoadingSpinner';
import { TableProps } from '@waldur/table/Table';

export const TableLoadingSpinnerContainer = (props: TableProps) =>
  (props.loading && props.sorting && !props.sorting.loading) ||
  (props.sorting && props.sorting.loading) ? (
    <LoadingSpinnerIcon />
  ) : null;
