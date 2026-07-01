import { ArrowsClockwiseIcon } from '@phosphor-icons/react';

import { translate } from '@/i18n';
import { LoadingSpinner } from '@/table/TableRefreshButton';

interface RefreshButtonProps {
  refetch;
  loading?: boolean;
  /** Accessible label / tooltip for the icon-only button. */
  title?: string;
}

export const RefreshButton = (props: RefreshButtonProps) => {
  const label = props.title ?? translate('Refresh');
  return props.loading ? (
    <LoadingSpinner />
  ) : (
    <button
      type="button"
      className="btn btn-icon btn-text-secondary"
      onClick={props.refetch}
      title={label}
      aria-label={label}
    >
      <ArrowsClockwiseIcon size={20} weight="bold" />
    </button>
  );
};
