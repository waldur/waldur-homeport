import { UIView, UISref, UISrefActive } from '@uirouter/react';
import React, { FunctionComponent, useMemo, useState, useContext } from 'react';
import { useSelector } from 'react-redux';

import { MasterInit } from '@waldur/metronic/layout/MasterInit';
import { SelectWorkspaceToggle } from '@waldur/navigation/workspace/SelectWorkspaceToggle';
import { getUser } from '@waldur/workspace/selectors';

import { AppFooter } from './AppFooter';
import { LayoutContext, LayoutContextInterface } from './context';
import { CookiesConsent } from './cookies/CookiesConsent';
import { AppHeader } from './header/AppHeader';
import { ExternalLinks } from './header/ExternalLinks';
import { UnifiedSidebar } from './sidebar/UnifiedSidebar';

const TabsList: FunctionComponent = () => {
  const ctx = useContext(LayoutContext);
  return (
    <>
      {(ctx.tabs || []).map((tab, index) => (
        <UISrefActive class="here" key={index}>
          <div className="menu-item" data-kt-menu-trigger="click">
            <span className="menu-link py-3">
              <UISref to={tab.to}>
                <a className="menu-title">{tab.title}</a>
              </UISref>
            </span>
          </div>
        </UISrefActive>
      ))}
    </>
  );
};

export const Layout: React.FC = ({ children }) => {
  const currentUser = useSelector(getUser);
  const [actions, setActions] = useState(null);
  const [tabs, setTabs] = useState(null);
  const [sidebarKey, setSidebarKey] = useState('');
  const context = useMemo<Partial<LayoutContextInterface>>(
    () => ({ setActions, sidebarKey, setSidebarKey, tabs, setTabs }),
    [setActions, sidebarKey, setSidebarKey, tabs, setTabs],
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
                  <div className="d-flex align-items-stretch">
                    <div className="header-menu align-items-stretch">
                      <div className="menu menu-lg-rounded menu-column menu-lg-row menu-state-bg menu-title-gray-700 menu-state-title-primary menu-state-icon-primary menu-state-bullet-primary menu-arrow-gray-400 fw-bold my-5 my-lg-0 align-items-stretch">
                        <TabsList />
                        <ExternalLinks />
                      </div>
                    </div>
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
