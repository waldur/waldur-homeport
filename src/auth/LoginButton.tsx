import { ReactNode } from 'react';

import { translate } from '@waldur/i18n';

import './LoginButton.css';

export const LoginButton = ({
  image,
  icon,
  label,
  onClick,
}: {
  image?: React.ReactNode;
  icon?: ReactNode;
  label: string;
  onClick?(): void;
}) => (
  <button className="login-button" onClick={onClick}>
    <div className="login-button-icon">
      {image}
      {icon && <span className="svg-icon">{icon}</span>}
    </div>
    <div className="login-button-text">
      {translate('Sign in with {label}', { label })}
    </div>
  </button>
);
