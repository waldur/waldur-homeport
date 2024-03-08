import { FunctionComponent } from 'react';
import { Button } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
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
    {translate(label)}
  </Button>
);
