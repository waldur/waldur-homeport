import { FunctionComponent } from 'react';
import { Button } from 'react-bootstrap';

import './Button.scss';

interface ButtonProps {
  label: string;
  iconPrefix?;
  onClick: () => void;
}

export const SharedButton: FunctionComponent<ButtonProps> = ({
  label,
  iconPrefix,
  onClick,
}) => (
  <Button onClick={onClick}>
    {iconPrefix && (
      <>
        <img src={iconPrefix} alt="icon" />
        &nbsp;
      </>
    )}
    {label}
  </Button>
);
