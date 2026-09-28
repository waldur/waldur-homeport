import { ArrowsClockwiseIcon } from '@phosphor-icons/react';

import { BaseButton } from 'waldur-ui';

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
    <BaseButton
      variant="text-secondary"
      onClick={props.refetch}
      tooltip={label}
      iconNode={<ArrowsClockwiseIcon size={20} weight="bold" />}
    />
  );
};
