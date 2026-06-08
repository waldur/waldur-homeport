import { IconProps, SpinnerIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import { FunctionComponent } from 'react';

export const LoadingSpinnerSimple = ({ className, ...rest }: IconProps) => {
  const textClass =
    className && className.includes('text-') ? '' : 'text-primary';
  return (
    <SpinnerIcon
      className={classNames('animation-spin', textClass, className)}
      role="status"
      weight="bold"
      {...rest}
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
      {}
      <LoadingSpinnerSimple />
    </h1>
    {helpText && <p className="text-muted mt-3 mb-0">{helpText}</p>}
  </div>
);
