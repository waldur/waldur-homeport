import { FunctionComponent } from 'react';

import { LoadingSpinnerIcon } from '@waldur/core/LoadingSpinner';
import { Sorting } from '@waldur/table/types';

interface TableLoadingSpinnerContainerProps {
  loading?: boolean;
  sorting?: Sorting & { loading?: boolean };
}

export const TableLoadingSpinnerContainer: FunctionComponent<
  TableLoadingSpinnerContainerProps
> = (props) =>
  (props.loading && props.sorting && !props.sorting.loading) ||
  (props.sorting && props.sorting.loading) ? (
    <LoadingSpinnerIcon />
  ) : null;
