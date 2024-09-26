import { ArrowClockwise } from '@phosphor-icons/react';
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
      variant="outline btn-outline-default"
      className={'min-w-100px' + (className ? ` ${className}` : '')}
      size={size}
      onClick={!isLoading ? refetch : undefined}
    >
      {isLoading ? (
        <LoadingSpinnerIcon />
      ) : (
        <span className={'svg-icon' + (size !== 'sm' ? ' svg-icon-2' : '')}>
          <ArrowClockwise />
        </span>
      )}
      {translate('Refresh')}
    </Button>
  );
};
