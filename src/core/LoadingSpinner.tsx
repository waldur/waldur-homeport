import { SpinnerIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';

export const LoadingSpinnerIcon = ({ className }: { className? }) => (
  <SpinnerIcon
    className={'animation-spin text-primary' + (className || '')}
    data-testid="spinner"
    role="status"
  />
);

export const LoadingSpinner: FunctionComponent = () => (
  <h1 className="text-center">
    <LoadingSpinnerIcon />
  </h1>
);
