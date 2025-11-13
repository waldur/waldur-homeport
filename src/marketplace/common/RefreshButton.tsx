import { ArrowClockwiseIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import { Button } from 'react-bootstrap';

import { LoadingSpinnerIcon } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';

interface RefreshButtonProps {
  size?: 'sm' | 'lg';
  refetch;
  isLoading?: boolean;
  className?: string;
}

export const RefreshButton = ({
  size,
  refetch,
  isLoading,
  className,
}: RefreshButtonProps) => {
  return (
    <Button
      variant="tertiary"
      className={classNames('min-w-100px', className)}
      size={size}
      onClick={!isLoading ? refetch : undefined}
    >
      {isLoading ? (
        // eslint-disable-next-line waldur-custom/enforce-phosphor-icon-weight
        <LoadingSpinnerIcon />
      ) : (
        <span className={'svg-icon' + (size !== 'sm' ? ' svg-icon-2' : '')}>
          <ArrowClockwiseIcon weight="bold" />
        </span>
      )}
      {translate('Refresh')}
    </Button>
  );
};
