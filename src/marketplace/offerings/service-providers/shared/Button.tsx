import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import './Button.scss';

interface ButtonProps {
  label: string;
  iconPrefix?;
  onClick: () => void;
}

export const Button: FunctionComponent<ButtonProps> = ({
  label,
  iconPrefix,
  onClick,
}) => (
  <button type="button" className="btn btn-default button" onClick={onClick}>
    {iconPrefix && (
      <>
        <img src={iconPrefix} />
        &nbsp;
      </>
    )}
    {translate(label)}
  </button>
);
