import { SignOut } from '@phosphor-icons/react';
import Qs from 'qs';
import { FunctionComponent } from 'react';

import { getQueryString } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';

import { AuthService } from '../AuthService';

export const AuthLogoutFailed: FunctionComponent = () => {
  const qs = Qs.parse(getQueryString());
  const message = qs?.message;

  return (
    <div className="middle-box text-center">
      <h3 className="app-title centered">{translate('Logout failed')}</h3>
      {typeof message === 'string' && <p className="mt-3">{message}</p>}
      <p className="mt-3">
        <button
          className="text-btn"
          type="button"
          onClick={AuthService.localLogout}
        >
          <span className="svg-icon svg-icon-2">
            <SignOut />
          </span>{' '}
          {translate('Perform local logout')}
        </button>
      </p>
    </div>
  );
};
