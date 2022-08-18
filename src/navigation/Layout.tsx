import classNames from 'classnames';
import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import { PermissionDataProvider } from '@waldur/auth/PermissionLayout';
import WarningBar from '@waldur/auth/WarningBar';
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
  const [fullPage, setFullPage] = useState(false);
  const context = useMemo<Partial<LayoutContextInterface>>(
    () => ({
      setActions,
      tabs,
      setTabs,
      fullPage,
      setFullPage,
    }),
    [setActions, tabs, setTabs, fullPage, setFullPage],
  );

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
              {(actions || tabs) && (
                <div
                  className={classNames('content d-flex flex-column', {
                    'full-page': fullPage,
                  })}
                >
                  <Toolbar actions={actions} />
                </div>
              )}
              <div className="post d-flex flex-column-fluid">
                <div className={fullPage ? 'w-100' : 'container-xxl'}>
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
