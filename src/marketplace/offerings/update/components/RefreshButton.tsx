import { ArrowsClockwiseIcon } from '@phosphor-icons/react';

import { LoadingSpinner } from '@waldur/table/TableRefreshButton';

interface RefreshButtonProps {
  refetch;
  loading?: boolean;
}

export const RefreshButton = (props: RefreshButtonProps) =>
  props.loading ? (
    <LoadingSpinner />
  ) : (
    <button
      type="button"
      className="btn btn-icon btn-active-light btn-color-muted"
      onClick={props.refetch}
    >
      <ArrowsClockwiseIcon size={20} data-cy="loading-spinner" weight="bold" />
    </button>
  );
