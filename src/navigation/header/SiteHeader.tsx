import { FunctionComponent } from 'react';
import { Button } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { AuthService } from '@waldur/auth/AuthService';
import { translate } from '@waldur/i18n';
import { UsersService } from '@waldur/user/UsersService';

import { getTitle } from '../title';
import { goBack } from '../utils';

import './SiteHeader.scss';

export const SiteHeader: FunctionComponent = () => {
  const pageTitle = useSelector(getTitle);

  return (
    <div className="header align-items-stretch">
      <div className="container-fluid d-flex flex-stack">
        <div className="page-title d-flex align-items-center flex-wrap me-3 mb-5 mb-lg-0">
          <h1 className="d-flex text-dark fw-bolder fs-3 align-items-center my-1">
            {pageTitle}
          </h1>
        </div>
        <nav className="navbar navbar-static-top white-bg mb-0">
          <ul className="nav navbar-top-links pull-right">
            {AuthService.isAuthenticated() &&
              UsersService.isCurrentUserValid() && (
                <li className="ms-2">
                  <Button variant="light" onClick={goBack}>
                    <i className="fa fa-arrow-left" /> {translate('Back')}
                  </Button>
                </li>
              )}
            {AuthService.isAuthenticated() ? (
              <li className="ms-2">
                <Button variant="danger" onClick={() => AuthService.logout()}>
                  <i className="fa fa-sign-out" /> {translate('Log out')}
                </Button>
              </li>
            ) : (
              <li className="ms-2">
                <Button
                  variant="primary"
                  onClick={() => AuthService.localLogout()}
                >
                  <i className="fa fa-sign-in" /> {translate('Login')}
                </Button>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </div>
  );
};
