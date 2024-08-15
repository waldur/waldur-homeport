import { ArrowClockwise } from '@phosphor-icons/react';
import { Button } from 'react-bootstrap';

import { LoadingSpinnerIcon } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';

interface RefreshButtonProps {
  size?: 'sm' | 'lg';
  refetch;
  isLoading?: boolean;
}

export const RefreshButton = ({
  size,
  refetch,
  isLoading,
}: RefreshButtonProps) => {
  return (
    <Button
      variant="outline-dark"
      className="btn-outline btn-active-secondary btn-icon-dark border-gray-400 w-100px px-2"
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
