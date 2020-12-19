import { FunctionComponent } from 'react';

interface CancelButtonProps {
  disabled?: boolean;
  label: string;
  onClick?(): void;
}

export const CancelButton: FunctionComponent<CancelButtonProps> = (props) => {
  const { label, ...rest } = props;
  return (
    <button className="btn btn-link" type="button" {...rest}>
      {label}
    </button>
  );
};
