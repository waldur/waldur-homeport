import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import { getTitle } from '../title';

import { UserDropdownMenu } from './UserDropdown';

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
        <div className="d-flex align-items-stretch flex-shrink-0">
          <div className="d-flex align-items-center ms-1 ms-lg-3">
            <UserDropdownMenu />
          </div>
        </div>
      </div>
    </div>
  );
};
