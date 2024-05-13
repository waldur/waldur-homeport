import { ArrowClockwise } from '@phosphor-icons/react';
import { Button } from 'react-bootstrap';

import { LoadingSpinnerIcon } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';

export const RefreshButton = ({ refetch, isLoading }) => {
  return (
    <Button
      variant="outline-dark"
      className="btn-outline btn-active-secondary btn-icon-dark border-gray-400 w-100px px-2"
      size="sm"
      onClick={!isLoading && refetch}
    >
      {isLoading ? (
        <LoadingSpinnerIcon />
      ) : (
        <span className="svg-icon">
          <ArrowClockwise />
        </span>
      )}
      {translate('Refresh')}
    </Button>
  );
};
