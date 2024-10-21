import { useCurrentStateAndParams } from '@uirouter/react';
import classNames from 'classnames';
import React, { PropsWithChildren, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { ImpersonationBar } from '@waldur/administration/ImpersonationBar';
import { AuthService } from '@waldur/auth/AuthService';
import { PermissionDataProvider } from '@waldur/auth/PermissionLayout';
import WarningBar from '@waldur/auth/WarningBar';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { DefaultLayoutConfig, useLayout } from '@waldur/metronic/layout/core';
import { MasterLayout } from '@waldur/metronic/layout/MasterLayout';
import { getCurrentUser } from '@waldur/user/UsersService';
import { setCurrentUser } from '@waldur/workspace/actions';
import { getImpersonatorUser, getUser } from '@waldur/workspace/selectors';

import { AppFooter } from './AppFooter';
import { LayoutContext, LayoutContextInterface } from './context';
import { CookiesConsent } from './cookies/CookiesConsent';
import { AppHeader } from './header/AppHeader';
import { BreadcrumbMain } from './header/breadcrumb/BreadcrumbMain';
import { OutstandingBar } from './OutstandingBar';
import { UnifiedSidebar } from './sidebar/UnifiedSidebar';
import { Tab } from './Tab';
import { Toolbar } from './Toolbar';
import { IBreadcrumbItem } from './types';
import { useTabs } from './useTabs';

export const Layout: React.FC<PropsWithChildren> = ({ children }) => {
  const dispatch = useDispatch();
  const { state } = useCurrentStateAndParams();
  const currentUser = useSelector(getUser);
  const impersonatorUser = useSelector(getImpersonatorUser);
  const [actions, setActions] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState<IBreadcrumbItem[]>([]);
  const [extraTabs, setExtraTabs] = useState<Tab[]>([]);
  const [fullPage, setFullPage] = useState(false);
  const [PageHero, setPageHero] = useState<React.ReactNode>(null);
  const [PageBar, setPageBar] = useState<React.ReactNode>(null);
  const [ExtraToolbar, setExtraToolbar] = useState<React.ReactNode>(null);
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
      breadcrumbs,
      setExtraToolbar,
    }),
    [
      setActions,
      extraTabs,
      setExtraTabs,
      fullPage,
      setFullPage,
      setPageHero,
      setPageBar,
      setBreadcrumbs,
      breadcrumbs,
      setExtraToolbar,
    ],
  );

  const layout = useLayout();
  const tabs = useTabs();

  const showToolbar = Boolean(actions || tabs?.length || extraTabs?.length);

  useEffect(() => {
    layout.setLayout({
      aside: currentUser ? DefaultLayoutConfig.aside : false,
      toolbar: showToolbar ? DefaultLayoutConfig.toolbar : false,
      extraToolbar: ExtraToolbar ? DefaultLayoutConfig.extraToolbar : false,
      hero: PageHero ? DefaultLayoutConfig.hero : false,
      outstandingBar: PageBar ? DefaultLayoutConfig.outstandingBar : false,
      content: {
        width: 'fluid',
      },
    });
  }, [showToolbar, fullPage, PageHero, PageBar, ExtraToolbar, currentUser]);

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
                <AppHeader hasBreadcrumbs={Boolean(breadcrumbs.length)} />
              )}
              <BreadcrumbMain mobile />
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
                {ExtraToolbar && (
                  <div className="extra-toolbar">{ExtraToolbar}</div>
                )}
                <div className="post w-100 d-flex flex-column-fluid">
                  {state.data.auth && !currentUser ? (
                    <LoadingSpinner />
                  ) : (
                    children
                  )}
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
