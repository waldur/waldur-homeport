import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import WarningBar from '@waldur/auth/WarningBar';
import { MasterLayout } from '@waldur/metronic/layout/MasterLayout';
import { getUser } from '@waldur/workspace/selectors';

import { AppFooter } from './AppFooter';
import { LayoutContext, LayoutContextInterface } from './context';
import { CookiesConsent } from './cookies/CookiesConsent';
import { AppHeader } from './header/AppHeader';
import { UnifiedSidebar } from './sidebar/UnifiedSidebar';

export const Layout: React.FC = ({ children }) => {
  const currentUser = useSelector(getUser);
  const [tabs, setTabs] = useState(null);
  const [sidebarKey, setSidebarKey] = useState('');
  const context = useMemo<Partial<LayoutContextInterface>>(
    () => ({ sidebarKey, setSidebarKey, tabs, setTabs }),
    [sidebarKey, setSidebarKey, tabs, setTabs],
  );
  if (!currentUser) {
    return null;
  }
  return (
    <LayoutContext.Provider value={context}>
      <div className="d-flex flex-column flex-root">
        <div className="page d-flex flex-row flex-column-fluid">
          <UnifiedSidebar />
          <div className="wrapper d-flex flex-column flex-row-fluid">
            <CookiesConsent />
            <AppHeader />
            <WarningBar />
            <div className="content d-flex flex-column flex-column-fluid">
              <div className="post d-flex flex-column-fluid">
                <div className="container-xxl">
                  {children}
                  <MasterLayout />
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
