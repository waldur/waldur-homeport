import { SpinnerIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import { FunctionComponent } from 'react';

export const LoadingSpinnerIcon = ({ className }: { className?: string }) => {
  const textClass =
    className && className.includes('text-') ? '' : 'text-primary';
  return (
    <SpinnerIcon
      className={classNames('animation-spin', textClass, className)}
      data-testid="spinner"
      role="status"
      weight="bold"
    />
  );
};

interface LoadingSpinnerProps {
  helpText?: string;
  className?: string;
}

export const LoadingSpinner: FunctionComponent<LoadingSpinnerProps> = ({
  helpText,
  className,
}) => (
  <div className={classNames('text-center mb-5', className)}>
    <h1>
      {/* eslint-disable-next-line waldur-custom/enforce-phosphor-icon-weight */}
      <LoadingSpinnerIcon />
    </h1>
    {helpText && <p className="text-muted mt-3 mb-0">{helpText}</p>}
  </div>
);
