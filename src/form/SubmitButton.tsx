import { FC } from 'react';

import { LoadingSpinnerIcon } from '@waldur/core/LoadingSpinner';

interface SubmitButtonProps {
  submitting: boolean;
  label: string;
  id?: string;
  disabled?: boolean;
  className?: string;
  onClick?(): void;
}

export const SubmitButton: FC<SubmitButtonProps> = ({
  className = 'btn btn-primary',
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
    {props.label}
  </button>
);
