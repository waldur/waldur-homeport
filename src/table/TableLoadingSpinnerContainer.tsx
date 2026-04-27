import { FunctionComponent } from 'react';

import { LoadingSpinnerSimple } from '@/core/LoadingSpinner';
import { Sorting } from '@/table/types';

interface TableLoadingSpinnerContainerProps {
  loading?: boolean;
  sorting?: Sorting & { loading?: boolean };
}

export const TableLoadingSpinnerContainer: FunctionComponent<
  TableLoadingSpinnerContainerProps
> = (props) =>
  (props.loading && props.sorting && !props.sorting.loading) ||
  (props.sorting && props.sorting.loading) ? (
    <LoadingSpinnerSimple />
  ) : null;
