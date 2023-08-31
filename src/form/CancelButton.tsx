import { FunctionComponent } from 'react';
import { Button, ButtonProps } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { closeModalDialog } from '@waldur/modal/actions';

interface CancelButtonProps extends ButtonProps {
  disabled?: boolean;
  label: string;
  onClick?(): void;
}

export const CancelButton: FunctionComponent<CancelButtonProps> = (props) => {
  const { label, onClick, ...rest } = props;
  const dispatch = useDispatch();
  const handleClose = () => {
    if (onClick) {
      onClick();
    } else {
      dispatch(closeModalDialog());
    }
  };

  return (
    <Button variant="link" type="button" onClick={handleClose} {...rest}>
      {label}
    </Button>
  );
};
