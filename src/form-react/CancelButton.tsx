import * as React from 'react';

interface CancelButtonProps {
  disabled?: boolean;
  label: string;
  onClick?(): void;
}

export const CancelButton = (props: CancelButtonProps) => {
  const { label, ...rest } = props;
  return (
    <button
      className="btn btn-link"
      type="button"
      {...rest}
    >
      {label}
    </button>
  );
};
