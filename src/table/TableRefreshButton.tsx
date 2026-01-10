import { ArrowsClockwiseIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';

import { Sorting } from '@waldur/table/types';

export const LoadingSpinner: FunctionComponent = () => (
  <button type="button" className="btn btn-icon btn-flush">
    <span className="animation-spin">
      <ArrowsClockwiseIcon size={20} data-cy="loading-spinner" weight="bold" />
    </span>
  </button>
);

interface TableRefreshButtonProps {
  loading?: boolean;
  sorting?: Sorting & { loading?: boolean };
  fetch: (force?: boolean) => void;
}

export const TableRefreshButton: FunctionComponent<TableRefreshButtonProps> = (
  props,
) => {
  // Show spinner when:
  // 1. loading is true (general loading state)
  // 2. sorting.loading is true (sorting in progress)
  const showSpinner = props.loading || (props.sorting && props.sorting.loading);

  return showSpinner ? (
    <LoadingSpinner />
  ) : (
    <button
      type="button"
      className="btn btn-icon btn-text-secondary"
      onClick={() => props.fetch(true)}
    >
      <ArrowsClockwiseIcon size={20} data-cy="loading-spinner" weight="bold" />
    </button>
  );
};
