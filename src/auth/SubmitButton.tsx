import React from 'react';
import { Button } from 'react-bootstrap';

interface SubmitButtonProps {
  submitting: boolean;
  invalid?: boolean;
  label?: string;
  variant?: string;
  block?: boolean;
}

export const SubmitButton: React.FC<SubmitButtonProps> = ({
  submitting,
  invalid,
  label,
  children,
  variant,
}) => (
  <Button type="submit" variant={variant} disabled={submitting || invalid}>
    {submitting && (
      <>
        <i className="fa fa-spinner fa-spin m-r-xs" />{' '}
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
