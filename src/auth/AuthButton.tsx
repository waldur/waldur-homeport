import * as React from 'react';
import { useDispatch } from 'react-redux';
import { Dispatch } from 'redux';

import { translate } from '@waldur/i18n';

export interface AuthButtonProps {
  providerKey: string;
  btnClass: string;
  iconClass: string;
  label: string;
  mode: string;
  onClick(dispatch: Dispatch): void;
}

export const AuthButton: React.FC<AuthButtonProps> = ({
  btnClass,
  iconClass,
  label,
  mode,
  onClick,
}) => {
  const dispatch = useDispatch();
  const caption =
    mode === 'register'
      ? translate('Register with {label}', { label })
      : translate('Sign in with {label}', { label });
  return (
    <div className="m-b-sm">
      <button
        onClick={() => onClick(dispatch)}
        className={`btn ${btnClass} btn-block`}
      >
        <i className={`fa ${iconClass}`} aria-hidden="true" /> {caption}
      </button>
    </div>
  );
};
