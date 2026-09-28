import { ReactNode } from 'react';

import { BaseButton } from 'waldur-ui';

import { translate } from '@/i18n';

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
  <BaseButton
    variant="tertiary"
    className="login-button gap-0"
    onClick={onClick}
    label={
      <>
        <div className="login-button-icon">
          {image}
          {icon && <span className="svg-icon">{icon}</span>}
        </div>
        <div className="login-button-text">
          {translate('Sign in with {label}', { label })}
        </div>
      </>
    }
  />
);
