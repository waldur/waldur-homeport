import * as React from 'react';

import { ngInjector } from '@waldur/core/services';
import { translate } from '@waldur/i18n';

export const LogoutLink = () => {
  const logout = () => ngInjector.get('authService').logout();
  return (
    <li>
      <a onClick={logout}>
        <i className="fa fa-sign-out"></i> {translate('Log out')}
      </a>
    </li>
  );
};
