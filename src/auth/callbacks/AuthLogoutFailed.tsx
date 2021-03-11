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
      {message && <p className="m-t-md">{message}</p>}
      <p className="m-t-md">
        <a onClick={AuthService.localLogout}>
          <i className="fa fa-sign-out"></i> {translate('Perform local logout')}
        </a>
      </p>
    </div>
  );
};
