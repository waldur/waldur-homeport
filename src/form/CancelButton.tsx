import { FunctionComponent } from 'react';
import { Button, ButtonProps } from 'react-bootstrap';

interface CancelButtonProps extends ButtonProps {
  disabled?: boolean;
  label: string;
  onClick?(): void;
}

export const CancelButton: FunctionComponent<CancelButtonProps> = (props) => {
  const { label, ...rest } = props;
  return (
    <Button variant="link" type="button" {...rest}>
      {label}
    </Button>
  );
};
