import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import 'world-flags-sprite/stylesheets/flags16.css';

import { ENV } from '@waldur/configs/default';

import { getTitle, getSubtitle } from '../title';

import { SearchToggle } from './SearchToggle';
import { UserDropdownMenu } from './UserDropdown';

const Logo = require('@waldur/images/logo.svg');

const AsideMobileToggle: FunctionComponent = () => (
  <div
    className="btn btn-icon btn-active-light-primary w-30px h-30px w-md-40px h-md-40px"
    id="kt_aside_mobile_toggle"
  >
    <span className="svg-icon svg-icon-1">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          d="M21 7H3C2.4 7 2 6.6 2 6V4C2 3.4 2.4 3 3 3H21C21.6 3 22 3.4 22 4V6C22 6.6 21.6 7 21 7Z"
          fill="currentColor"
        ></path>
        <path
          opacity="0.3"
          d="M21 14H3C2.4 14 2 13.6 2 13V11C2 10.4 2.4 10 3 10H21C21.6 10 22 10.4 22 11V13C22 13.6 21.6 14 21 14ZM22 20V18C22 17.4 21.6 17 21 17H3C2.4 17 2 17.4 2 18V20C2 20.6 2.4 21 3 21H21C21.6 21 22 20.6 22 20Z"
          fill="currentColor"
        ></path>
      </svg>
    </span>
  </div>
);

export const AppHeader: FunctionComponent = () => {
  const pageTitle = useSelector(getTitle);
  const pageSubtitle = useSelector(getSubtitle);
  return (
    <div className="header align-items-stretch">
      <div className="container-fluid d-flex align-items-stretch justify-content-between">
        <div className="d-flex align-items-center d-lg-none ms-n2 me-2">
          <AsideMobileToggle />

          <div className="d-flex align-items-center flex-grow-1 flex-lg-grow-0">
            <a className="d-lg-none">
              <img
                alt="Logo"
                src={ENV.plugins.WALDUR_CORE.SIDEBAR_LOGO_MOBILE || Logo}
                className="h-30px"
              />
            </a>
          </div>
        </div>
        <div className="d-flex align-items-stretch justify-content-between flex-lg-grow-1">
          <div className="page-title flex-wrap me-3 mb-5 mt-3 mb-lg-0">
            <h1 className="text-dark fw-bolder fs-3 my-1">{pageTitle}</h1>
            {pageSubtitle && (
              <small className="text-muted text-uppercase">
                {pageSubtitle}
              </small>
            )}
          </div>
          <div className="d-flex align-items-stretch flex-shrink-0">
            <SearchToggle />
            <div className="d-flex align-items-center ms-1 ms-lg-3">
              <UserDropdownMenu />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
