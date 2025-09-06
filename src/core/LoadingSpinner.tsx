import { SpinnerIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';

export const LoadingSpinnerIcon = ({ className }: { className? }) => (
  <SpinnerIcon
    className={'animation-spin text-primary' + (className || '')}
    data-testid="spinner"
    role="status"
  />
);

interface LoadingSpinnerProps {
  helpText?: string;
}

export const LoadingSpinner: FunctionComponent<LoadingSpinnerProps> = ({
  helpText,
}) => (
  <div className="text-center mb-5">
    <h1>
      <LoadingSpinnerIcon />
    </h1>
    {helpText && <p className="text-muted mt-3 mb-0">{helpText}</p>}
  </div>
);
