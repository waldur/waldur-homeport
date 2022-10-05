import classNames from 'classnames';
import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import { PermissionDataProvider } from '@waldur/auth/PermissionLayout';
import WarningBar from '@waldur/auth/WarningBar';
import { DefaultLayoutConfig, useLayout } from '@waldur/metronic/layout/core';
import { MasterLayout } from '@waldur/metronic/layout/MasterLayout';
import { getUser } from '@waldur/workspace/selectors';

import { AppFooter } from './AppFooter';
import { LayoutContext, LayoutContextInterface } from './context';
import { CookiesConsent } from './cookies/CookiesConsent';
import { AppHeader } from './header/AppHeader';
import { UnifiedSidebar } from './sidebar/UnifiedSidebar';
import { Toolbar } from './Toolbar';

export const Layout: React.FC = ({ children }) => {
  const currentUser = useSelector(getUser);
  const [actions, setActions] = useState(null);
  const [tabs, setTabs] = useState(null);
  const [extraTabs, setExtraTabs] = useState(null);
  const [fullPage, setFullPage] = useState(false);
  const context = useMemo<Partial<LayoutContextInterface>>(
    () => ({
      setActions,
      tabs,
      setTabs,
      extraTabs,
      setExtraTabs,
      fullPage,
      setFullPage,
    }),
    [setActions, tabs, setTabs, extraTabs, setExtraTabs, fullPage, setFullPage],
  );

  const layout = useLayout();
  useEffect(() => {
    layout.setLayout({
      toolbar: actions || tabs ? DefaultLayoutConfig.toolbar : false,
      content: {
        width: fullPage ? 'fluid' : 'fixed',
      },
    });
  }, [tabs, fullPage]);

  if (!currentUser) {
    return null;
  }
  return (
    <LayoutContext.Provider value={context}>
      <PermissionDataProvider>
        <div className="d-flex flex-column flex-root">
          <div className="page d-flex flex-row flex-column-fluid">
            <UnifiedSidebar />
            <div className="wrapper d-flex flex-column flex-row-fluid">
              <CookiesConsent />
              <AppHeader />
              <WarningBar />
              <div
                className={classNames('content d-flex flex-column-fluid', {
                  'full-page': fullPage,
                })}
              >
                {(actions || tabs) && <Toolbar actions={actions} />}
                <div className="post d-flex flex-column-fluid">
                  {children}
                  <MasterLayout />
                </div>
              </div>
              <AppFooter />
            </div>
          </div>
        </div>
      </PermissionDataProvider>
    </LayoutContext.Provider>
  );
};
