import { ArrowsClockwiseIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';

import { IconButton } from '@/core/buttons/IconButton';
import { translate } from '@/i18n';
import { Sorting } from '@/table/types';

export const LoadingSpinner: FunctionComponent = () => (
  <IconButton
    iconNode={
      <span className="animation-spin">
        <ArrowsClockwiseIcon weight="bold" />
      </span>
    }
    tooltip={translate('Loading')}
    onClick={() => {}}
    variant="flush"
    disabled
  />
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

  if (showSpinner) {
    return <LoadingSpinner />;
  }

  return (
    <IconButton
      iconNode={<ArrowsClockwiseIcon weight="bold" />}
      tooltip={translate('Refresh')}
      onClick={() => props.fetch(true)}
      variant="text-secondary"
    />
  );
};
