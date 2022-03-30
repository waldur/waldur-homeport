import { UIView } from '@uirouter/react';
import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import { MasterInit } from '@waldur/metronic/layout/MasterInit';
import { SelectWorkspaceToggle } from '@waldur/navigation/workspace/SelectWorkspaceToggle';
import { getUser } from '@waldur/workspace/selectors';

import { AppFooter } from './AppFooter';
import { BreadcrumbsContainer } from './breadcrumbs/BreadcrumbsContainer';
import { LayoutContext, LayoutContextInterface } from './context';
import { CookiesConsent } from './cookies/CookiesConsent';
import { AppHeader } from './header/AppHeader';
import { UnifiedSidebar } from './sidebar/UnifiedSidebar';
import { getTitle } from './title';

export const Layout: React.FC = ({ children }) => {
  const pageTitle = useSelector(getTitle);
  const currentUser = useSelector(getUser);
  const [actions, setActions] = useState(null);
  const [sidebarKey, setSidebarKey] = useState('');
  const context = useMemo<LayoutContextInterface>(
    () => ({ setActions, sidebarKey, setSidebarKey }),
    [setActions, sidebarKey, setSidebarKey],
  );
  if (!currentUser) {
    return null;
  }
  return (
    <LayoutContext.Provider value={context}>
      <MasterInit />
      <div className="d-flex flex-column flex-root">
        <div className="page d-flex flex-row flex-column-fluid">
          <UnifiedSidebar />
          <div className="wrapper d-flex flex-column flex-row-fluid">
            <CookiesConsent />
            <AppHeader />
            <div className="content d-flex flex-column flex-column-fluid">
              <div className="toolbar">
                <div className="container-fluid d-flex flex-stack">
                  <div className="page-title d-flex align-items-center flex-wrap me-3 mb-5 mb-lg-0">
                    <h1 className="d-flex text-dark fw-bolder fs-3 align-items-center my-1">
                      {pageTitle}
                    </h1>
                    <span className="h-20px border-gray-300 border-start mx-4"></span>
                    <BreadcrumbsContainer />
                  </div>
                  <div className="d-flex align-items-center gap-2 gap-lg-3">
                    <SelectWorkspaceToggle />
                    {actions}
                  </div>
                </div>
              </div>
              <div className="post d-flex flex-column-fluid">
                <div className="container-xxl">
                  {children}
                  <UIView />
                </div>
              </div>
            </div>
            <AppFooter />
          </div>
        </div>
      </div>
    </LayoutContext.Provider>
  );
};
