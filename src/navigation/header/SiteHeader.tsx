import * as React from 'react';

import { ngInjector, ENV } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { UsersService } from '@waldur/user/UsersService';

import { goBack } from '../utils';
import './SiteHeader.scss';

export const SiteHeader = () => {
  const authService = ngInjector.get('authService');
  return (
    <div className="border-bottom">
      <nav className="navbar navbar-static-top white-bg m-b-none">
        {ENV.loginLogo && (
          <div className="navbar-header m-l-sm-xl">
            <a className="header-logo" onClick={goBack}>
              <img src={ENV.loginLogo} />
            </a>
          </div>
        )}
        <ul className="nav navbar-top-links pull-right">
          {UsersService.isCurrentUserValid() && (
            <li>
              <a onClick={goBack}>
                <i className="fa fa-arrow-left" /> {translate('Back')}
              </a>
            </li>
          )}
          {authService.isAuthenticated() && (
            <li>
              <a onClick={() => authService.logout()}>
                <i className="fa fa-sign-out" /> {translate('Log out')}
              </a>
            </li>
          )}
        </ul>
      </nav>
    </div>
  );
};
