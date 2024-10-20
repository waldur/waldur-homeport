import { FC, PropsWithChildren } from 'react';
import { Button } from 'react-bootstrap';

import { LoadingSpinnerIcon } from '@waldur/core/LoadingSpinner';

interface SubmitButtonProps {
  submitting: boolean;
  invalid?: boolean;
  label?: string;
  variant?: string;
  className?: string;
}

export const SubmitButton: FC<PropsWithChildren<SubmitButtonProps>> = ({
  submitting,
  invalid,
  label,
  children,
  className,
  variant = 'primary',
}) => (
  <Button
    type="submit"
    variant={variant}
    disabled={submitting || invalid}
    className={className}
  >
    {submitting && (
      <>
        <LoadingSpinnerIcon className="me-1" />{' '}
      </>
    )}
    {label}
    {children}
  </Button>
);
