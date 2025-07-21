import { FC, ReactNode } from 'react';

import { LoadingSpinnerIcon } from '@waldur/core/LoadingSpinner';

interface SubmitButtonProps {
  submitting: boolean;
  label?: string;
  children?: ReactNode;
  id?: string;
  disabled?: boolean;
  className?: string;
  onClick?(event): void;
}

export const SubmitButton: FC<SubmitButtonProps> = ({
  className = 'btn btn-primary',
  children,
  label,
  ...props
}) => (
  <button
    id={props.id}
    type="submit"
    className={className}
    disabled={props.submitting || props.disabled === true}
    onClick={props.onClick}
  >
    {props.submitting && <LoadingSpinnerIcon className="me-1" />}
    {children || label}
  </button>
);
