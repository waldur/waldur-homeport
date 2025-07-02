import { ArrowsClockwiseIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';

import { TableProps } from '@waldur/table/types';

export const LoadingSpinner: FunctionComponent = () => (
  <button type="button" className="btn btn-icon btn-flush">
    <span className="animation-spin">
      <ArrowsClockwiseIcon size={20} data-cy="loading-spinner" />
    </span>
  </button>
);

export const TableRefreshButton = (props: TableProps) =>
  (props.loading && props.sorting && !props.sorting.loading) ||
  (props.sorting && props.sorting.loading) ? (
    <LoadingSpinner />
  ) : (
    <button
      type="button"
      className="btn btn-icon btn-active-light"
      onClick={() => props.fetch(true)}
    >
      <ArrowsClockwiseIcon size={20} data-cy="loading-spinner" />
    </button>
  );
