import { useCurrentStateAndParams } from '@uirouter/react';
import classNames from 'classnames';
import React, { PropsWithChildren, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { ImpersonationBar } from '@waldur/administration/ImpersonationBar';
import { AuthService } from '@waldur/auth/AuthService';
import { PermissionDataProvider } from '@waldur/auth/PermissionLayout';
import WarningBar from '@waldur/auth/WarningBar';
import { DefaultLayoutConfig, useLayout } from '@waldur/metronic/layout/core';
import { MasterLayout } from '@waldur/metronic/layout/MasterLayout';
import { getCurrentUser } from '@waldur/user/UsersService';
import { setCurrentUser } from '@waldur/workspace/actions';
import { getImpersonatorUser, getUser } from '@waldur/workspace/selectors';

import { AppFooter } from './AppFooter';
import { LayoutContext, LayoutContextInterface } from './context';
import { CookiesConsent } from './cookies/CookiesConsent';
import { AppHeader } from './header/AppHeader';
import { OutstandingBar } from './OutstandingBar';
import { UnifiedSidebar } from './sidebar/UnifiedSidebar';
import { Tab } from './Tab';
import { Toolbar } from './Toolbar';
import { useTabs } from './useTabs';

export const Layout: React.FC<PropsWithChildren> = ({ children }) => {
  const dispatch = useDispatch();
  const { state } = useCurrentStateAndParams();
  const currentUser = useSelector(getUser);
  const impersonatorUser = useSelector(getImpersonatorUser);
  const [actions, setActions] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState(null);
  const [extraTabs, setExtraTabs] = useState<Tab[]>([]);
  const [fullPage, setFullPage] = useState(false);
  const [PageHero, setPageHero] = useState<React.ReactNode>(null);
  const [PageBar, setPageBar] = useState<React.ReactNode>(null);
  const context = useMemo<Partial<LayoutContextInterface>>(
    () => ({
      setActions,
      extraTabs,
      setExtraTabs,
      fullPage,
      setFullPage,
      setPageHero,
      setPageBar,
      setBreadcrumbs,
    }),
    [
      setActions,
      extraTabs,
      setExtraTabs,
      fullPage,
      setFullPage,
      setPageHero,
      setPageBar,
    ],
  );

  const layout = useLayout();
  const tabs = useTabs();

  const showToolbar = Boolean(actions || tabs?.length || extraTabs?.length);

  useEffect(() => {
    layout.setLayout({
      aside: currentUser ? DefaultLayoutConfig.aside : false,
      toolbar: showToolbar ? DefaultLayoutConfig.toolbar : false,
      hero: PageHero ? DefaultLayoutConfig.hero : false,
      outstandingBar: PageBar ? DefaultLayoutConfig.outstandingBar : false,
      content: {
        width: fullPage || PageHero ? 'fluid' : 'fixed',
      },
    });
  }, [showToolbar, fullPage, PageHero, PageBar, currentUser]);

  useEffect(() => {
    if (AuthService.isAuthenticated() && !currentUser) {
      getCurrentUser({ __skipLogout__: state?.data?.skipAuth }).then((user) => {
        dispatch(setCurrentUser(user));
      });
    }
  }, []);

  useEffect(() => {
    if (impersonatorUser) {
      setPageBar(<ImpersonationBar />);
    } else {
      setPageBar(null);
    }
    return () => {
      setPageBar(null);
    };
  }, [setPageBar, impersonatorUser]);

  return (
    <LayoutContext.Provider value={context}>
      <PermissionDataProvider>
        <div className="d-flex flex-column flex-root">
          {PageBar && <OutstandingBar>{PageBar}</OutstandingBar>}
          <div className="page d-flex flex-row flex-column-fluid">
            <UnifiedSidebar />
            <div className="wrapper d-flex flex-column flex-row-fluid">
              <CookiesConsent />
              {!state?.data?.hideHeader && (
                <AppHeader breadcrumbs={breadcrumbs} />
              )}
              <WarningBar />
              <div
                className={classNames(
                  'content d-flex flex-column flex-grow-1',
                  { 'full-page': fullPage },
                )}
              >
                {PageHero && (
                  <div className="hero w-100 d-flex flex-column">
                    {PageHero}
                  </div>
                )}
                {showToolbar && <Toolbar actions={actions} />}
                <div className="post w-100 d-flex flex-column-fluid">
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
