import * as React from 'react';
import { useDispatch } from 'react-redux';
import { Dispatch } from 'redux';

import { ngInjector } from '@waldur/core/services';
import { translate } from '@waldur/i18n';

const authenticate = (provider: string) => {
  const authService = ngInjector.get('authService');
  return authService
    .authenticate(provider)
    .then(response => authService.redirectOnSuccess(response));
};

export interface AuthButtonProps {
  providerKey: string;
  btnClass: string;
  iconClass: string;
  label: string;
  mode: string;
  onClick?(dispatch: Dispatch): void;
}

export const AuthButton: React.FC<AuthButtonProps> = ({
  providerKey,
  btnClass,
  iconClass,
  label,
  mode,
  onClick,
}) => {
  const dispatch = useDispatch();
  const prefix =
    mode === 'register'
      ? translate('Register with')
      : translate('Sign in with');
  return (
    <div className="m-b-sm">
      <button
        onClick={
          onClick ? () => onClick(dispatch) : () => authenticate(providerKey)
        }
        className={`btn ${btnClass} btn-block`}
      >
        <i className={`fa ${iconClass}`} aria-hidden="true" />{' '}
        {`${prefix} ${label}`}
      </button>
    </div>
  );
};
