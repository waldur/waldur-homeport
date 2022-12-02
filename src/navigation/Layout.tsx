import { useCurrentStateAndParams } from '@uirouter/react';
import classNames from 'classnames';
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { AuthService } from '@waldur/auth/AuthService';
import { PermissionDataProvider } from '@waldur/auth/PermissionLayout';
import WarningBar from '@waldur/auth/WarningBar';
import { DefaultLayoutConfig, useLayout } from '@waldur/metronic/layout/core';
import { MasterLayout } from '@waldur/metronic/layout/MasterLayout';
import { getCurrentUser } from '@waldur/user/UsersService';
import { setCurrentUser } from '@waldur/workspace/actions';
import { getUser } from '@waldur/workspace/selectors';

import { AppFooter } from './AppFooter';
import { LayoutContext, LayoutContextInterface } from './context';
import { CookiesConsent } from './cookies/CookiesConsent';
import { AppHeader } from './header/AppHeader';
import { UnifiedSidebar } from './sidebar/UnifiedSidebar';
import { Tab } from './Tab';
import { Toolbar } from './Toolbar';
import { useTabs } from './useTabs';

export const Layout: React.FC = ({ children }) => {
  const dispatch = useDispatch();
  const { state } = useCurrentStateAndParams();
  const currentUser = useSelector(getUser);
  const [actions, setActions] = useState(null);
  const [extraTabs, setExtraTabs] = useState<Tab[]>([]);
  const [fullPage, setFullPage] = useState(false);
  const context = useMemo<Partial<LayoutContextInterface>>(
    () => ({
      setActions,
      extraTabs,
      setExtraTabs,
      fullPage,
      setFullPage,
    }),
    [setActions, extraTabs, setExtraTabs, fullPage, setFullPage],
  );

  const layout = useLayout();
  const tabs = useTabs();

  useEffect(() => {
    layout.setLayout({
      toolbar: actions || tabs ? DefaultLayoutConfig.toolbar : false,
      content: {
        width: fullPage ? 'fluid' : 'fixed',
      },
    });
  }, [tabs, fullPage]);

  useEffect(() => {
    if (AuthService.isAuthenticated() && !currentUser) {
      getCurrentUser({ __skipLogout__: state?.data?.skipAuth }).then((user) => {
        dispatch(setCurrentUser(user));
      });
    }
  }, []);

  return (
    <LayoutContext.Provider value={context}>
      <PermissionDataProvider>
        <div className="d-flex flex-column flex-root">
          <div className="page d-flex flex-row flex-column-fluid">
            <UnifiedSidebar />
            <div className="wrapper d-flex flex-column flex-row-fluid">
              <CookiesConsent />
              {!state?.data?.hideHeader && <AppHeader />}
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
