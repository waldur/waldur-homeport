import React from 'react';
import { Button } from 'react-bootstrap';

interface SubmitButtonProps {
  submitting: boolean;
  invalid?: boolean;
  label?: string;
  variant?: string;
  block?: boolean;
  className?: string;
}

export const SubmitButton: React.FC<SubmitButtonProps> = ({
  submitting,
  invalid,
  label,
  children,
  variant,
  className,
}) => (
  <Button
    type="submit"
    variant={variant}
    disabled={submitting || invalid}
    className={className}
  >
    {submitting && (
      <>
        <i className="fa fa-spinner fa-spin me-1" />{' '}
      </>
    )}
    {label}
    {children}
  </Button>
);

SubmitButton.defaultProps = {
  variant: 'primary',
  block: true,
};
