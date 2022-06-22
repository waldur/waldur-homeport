import { UISref, UISrefActive } from '@uirouter/react';
import { FunctionComponent, useContext } from 'react';
import { useSelector } from 'react-redux';

import 'world-flags-sprite/stylesheets/flags16.css';

import { ENV } from '@waldur/configs/default';

import { BreadcrumbsContainer } from '../breadcrumbs/BreadcrumbsContainer';
import { LayoutContext } from '../context';
import { getTitle } from '../title';
import { QuickProjectSelectorToggle } from '../workspace/quick-project-selector/QuickProjectSelectorToggle';

import { ExternalLinks } from './ExternalLinks';
import { UserDropdownMenu } from './UserDropdown';

const TabsList: FunctionComponent = () => {
  const ctx = useContext(LayoutContext);
  return (
    <>
      {(ctx.tabs || []).map((tab, index) => (
        <UISrefActive class="here" key={index}>
          <UISref to={tab.to}>
            <a className="menu-item">
              <span className="menu-link py-3">
                <span className="menu-title">{tab.title}</span>
              </span>
            </a>
          </UISref>
        </UISrefActive>
      ))}
    </>
  );
};

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

const RightSidebarToggle = () => (
  <div
    className="d-flex align-items-center d-lg-none ms-2 me-n3"
    title="Show header menu"
  >
    <div
      className="btn btn-icon btn-active-light-primary w-30px h-30px w-md-40px h-md-40px"
      id="kt_header_menu_mobile_toggle"
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
            d="M13 11H3C2.4 11 2 10.6 2 10V9C2 8.4 2.4 8 3 8H13C13.6 8 14 8.4 14 9V10C14 10.6 13.6 11 13 11ZM22 5V4C22 3.4 21.6 3 21 3H3C2.4 3 2 3.4 2 4V5C2 5.6 2.4 6 3 6H21C21.6 6 22 5.6 22 5Z"
            fill="currentColor"
          ></path>
          <path
            opacity="0.3"
            d="M21 16H3C2.4 16 2 15.6 2 15V14C2 13.4 2.4 13 3 13H21C21.6 13 22 13.4 22 14V15C22 15.6 21.6 16 21 16ZM14 20V19C14 18.4 13.6 18 13 18H3C2.4 18 2 18.4 2 19V20C2 20.6 2.4 21 3 21H13C13.6 21 14 20.6 14 20Z"
            fill="currentColor"
          ></path>
        </svg>
      </span>
    </div>
  </div>
);

export const AppHeader: FunctionComponent = () => {
  const pageTitle = useSelector(getTitle);
  return (
    <div className="header align-items-stretch" id="kt_header_nav">
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
          <div className="page-title d-flex align-items-center flex-wrap me-3 mb-5 mb-lg-0">
            <h1 className="d-flex text-dark fw-bolder fs-3 align-items-center my-1">
              {pageTitle}
            </h1>
            <span className="h-20px border-gray-300 border-start mx-4"></span>
            <BreadcrumbsContainer />
          </div>
          <div className="d-flex align-items-stretch flex-shrink-0">
            <div className="d-flex align-items-center ms-1 ms-lg-3">
              <UserDropdownMenu />
            </div>
          </div>
          <RightSidebarToggle />
        </div>
      </div>
      <div className="toolbar">
        <div className="container-fluid d-flex flex-stack">
          <div className="d-flex align-items-stretch">
            <div
              className="header-menu align-items-stretch"
              data-kt-drawer="true"
              data-kt-drawer-name="header-menu"
              data-kt-drawer-activate="{default: true, lg: false}"
              data-kt-drawer-overlay="true"
              data-kt-drawer-width="{default:'200px', '300px': '250px'}"
              data-kt-drawer-direction="end"
              data-kt-drawer-toggle="#kt_header_menu_mobile_toggle"
              data-kt-swapper="true"
              data-kt-swapper-mode="prepend"
              data-kt-swapper-parent="{default: '#kt_body', lg: '#kt_header_nav'}"
            >
              <div className="menu menu-lg-rounded menu-column menu-lg-row menu-state-bg menu-title-gray-700 menu-state-title-primary menu-state-icon-primary menu-state-bullet-primary menu-arrow-gray-400 fw-bold my-5 my-lg-0 align-items-stretch">
                <QuickProjectSelectorToggle />
                <TabsList />
                <ExternalLinks />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
