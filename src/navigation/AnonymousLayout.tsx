import { useCurrentStateAndParams } from '@uirouter/react';
import classNames from 'classnames';
import { FunctionComponent, useEffect, useMemo, useState } from 'react';

import { PermissionDataProvider } from '@waldur/auth/PermissionLayout';
import WarningBar from '@waldur/auth/WarningBar';
import { DefaultLayoutConfig, useLayout } from '@waldur/metronic/layout/core';
import { MasterLayout } from '@waldur/metronic/layout/MasterLayout';
import { AppFooter } from '@waldur/navigation/AppFooter';
import { SiteHeader } from '@waldur/navigation/header/SiteHeader';

import { LayoutContext, LayoutContextInterface } from './context';
import { CookiesConsent } from './cookies/CookiesConsent';
import { SiteSidebar } from './sidebar/SiteSidebar';
import { Toolbar } from './Toolbar';

export const AnonymousLayout: FunctionComponent = () => {
  const { state } = useCurrentStateAndParams();
  const [tabs, setTabs] = useState(null);
  const [fullPage, setFullPage] = useState(false);
  const context = useMemo<Partial<LayoutContextInterface>>(
    () => ({ tabs, setTabs, fullPage, setFullPage }),
    [tabs, setTabs, fullPage, setFullPage],
  );

  const layout = useLayout();
  useEffect(() => {
    if (tabs) {
      layout.setLayout({
        toolbar: DefaultLayoutConfig.toolbar,
        content: {
          width: fullPage ? 'fluid' : 'fixed',
        },
      });
    } else {
      layout.setLayout({
        toolbar: {
          display: false,
        },
        content: {
          width: fullPage ? 'fluid' : 'fixed',
        },
      });
    }
  }, [tabs, fullPage]);

  return (
    <LayoutContext.Provider value={context}>
      <PermissionDataProvider>
        <div className="page d-flex flex-row flex-column-fluid">
          <SiteSidebar />
          <div className="wrapper d-flex flex-column flex-row-fluid">
            <CookiesConsent />
            {!state.data?.hideHeader && <SiteHeader />}
            <WarningBar />
            <div
              className={classNames('content d-flex flex-column-fluid', {
                'full-page': fullPage,
              })}
            >
              {tabs && <Toolbar />}
              <div className="post d-flex flex-column-fluid">
                <MasterLayout />
              </div>
            </div>
            <AppFooter />
          </div>
        </div>
      </PermissionDataProvider>
    </LayoutContext.Provider>
  );
};
