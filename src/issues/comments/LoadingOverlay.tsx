import { FunctionComponent } from 'react';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import './LoadingOverlay.scss';

interface LoadingOverlayProps {
  message?: string;
  className?: string;
}

export const LoadingOverlay: FunctionComponent<LoadingOverlayProps> = (
  props,
) => {
  const { message, className } = props;
  return (
    <div className={`loading-overlay ${className}`}>
      {message ? (
        <div className="loading-overlay__message">{message}</div>
      ) : (
        <LoadingSpinner />
      )}
    </div>
  );
};
