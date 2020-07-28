import * as React from 'react';

import { AuthService } from '@waldur/auth/AuthService';
import { ENV } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { UsersService } from '@waldur/user/UsersService';

import { goBack } from '../utils';

import './SiteHeader.scss';

export const SiteHeader = () => {
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
          {AuthService.isAuthenticated() && UsersService.isCurrentUserValid() && (
            <li>
              <a onClick={goBack}>
                <i className="fa fa-arrow-left" /> {translate('Back')}
              </a>
            </li>
          )}
          {AuthService.isAuthenticated() && (
            <li>
              <a onClick={() => AuthService.logout()}>
                <i className="fa fa-sign-out" /> {translate('Log out')}
              </a>
            </li>
          )}
        </ul>
      </nav>
    </div>
  );
};
