import { ArrowsClockwiseIcon } from '@phosphor-icons/react';

import { LoadingSpinner } from '@/table/TableRefreshButton';

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
      className="btn btn-icon btn-text-secondary"
      onClick={props.refetch}
    >
      <ArrowsClockwiseIcon size={20} weight="bold" />
    </button>
  );
