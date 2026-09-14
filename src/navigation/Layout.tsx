import { useCurrentStateAndParams } from '@uirouter/react';
import classNames from 'classnames';
import React, { PropsWithChildren, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import { SidebarProvider, useSidebar } from 'waldur-ui';

import { ImpersonationBar } from '@/administration/ImpersonationBar';
import * as AuthService from '@/auth/AuthService';
import { PermissionDataProvider } from '@/auth/PermissionLayout';
import WarningBar from '@/auth/WarningBar';
import { GRID_BREAKPOINTS } from '@/core/constants';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { InvitationCheck } from '@/invitations/InvitationCheck';
import { DefaultLayoutConfig, useLayout } from '@/metronic/layout/core';
import { MasterLayout } from '@/metronic/layout/MasterLayout';
import { GracePeriodWarningBar } from '@/project/GracePeriodWarningBar';
import { RemovedProjectWarningBar } from '@/project/RemovedProjectWarningBar';
import { OfferingUsersWarningBar } from '@/user/OfferingUsersWarningBar';
import { ProfileCompletenessProvider } from '@/user/ProfileCompletenessContext';
import { UsersService } from '@/user/UsersService';
import { useUser } from '@/workspace/hooks';
import { ReviewCheck } from '@/workspace/ReviewCheck';
import { getImpersonatorUser } from '@/workspace/selectors';

import { LayoutContext, LayoutContextInterface } from './context';
import { CookiesConsent } from './cookies/CookiesConsent';
import { AppFooter } from './footer/AppFooter';
import { Announcements } from './header/announcements/Announcements';
import { AppHeader } from './header/AppHeader';
import { BreadcrumbMain } from './header/breadcrumb/BreadcrumbMain';
import { OutstandingBar } from './OutstandingBar';
import { UnifiedSidebar } from './sidebar/UnifiedSidebar';
import { Tab } from './Tab';
import { Toolbar } from './Toolbar';
import { IBreadcrumbItem } from './types';
import { useTabs } from './useTabs';

export const Layout: React.FC<PropsWithChildren> = ({ children }) => (
  <SidebarProvider
    renderWrapper={false}
    mobileBreakpoint={GRID_BREAKPOINTS.lg}
    style={{ '--sidebar-width-icon': '75px' } as React.CSSProperties}
  >
    <LayoutContent>{children}</LayoutContent>
  </SidebarProvider>
);

const LayoutContent: React.FC<PropsWithChildren> = ({ children }) => {
  const { state } = useCurrentStateAndParams();
  const currentUser = useUser();
  const impersonatorUser = useSelector(getImpersonatorUser);
  const [actions, setActions] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState<IBreadcrumbItem[]>([]);
  const [extraTabs, setExtraTabs] = useState<Tab[]>([]);
  const [fullPage, setFullPage] = useState(false);
  const [PageHero, setPageHero] = useState<React.ReactNode>(null);
  const [PageBar, setPageBar] = useState<React.ReactNode>(null);
  const [ExtraAnnouncementBar, setExtraAnnouncementBar] =
    useState<React.ReactNode>(null);
  const [ExtraToolbar, setExtraToolbar] = useState<React.ReactNode>(null);
  const { state: sidebarState, setOpenMobile } = useSidebar();

  useEffect(() => {
    setOpenMobile(false);
  }, [state, setOpenMobile]);

  const context = useMemo<Partial<LayoutContextInterface>>(
    () => ({
      setActions,
      extraTabs,
      setExtraTabs,
      fullPage,
      setFullPage,
      setPageHero,
      setPageBar,
      setExtraAnnouncementBar,
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
      setExtraAnnouncementBar,
      setBreadcrumbs,
      breadcrumbs,
      setExtraToolbar,
    ],
  );

  const layout = useLayout();
  const tabs = useTabs();

  const showToolbar = Boolean(actions || tabs?.length > 1 || extraTabs?.length);

  useEffect(() => {
    // Synchronize aside.minimized with the real Sidebar's state from useSidebar()
    // rather than guessing or defaulting to false. This guarantees that whenever
    // the sidebar is collapsed (on mount, resize, user toggle, or navigation),
    // layout.config.aside.minimized is true and Metronic's header/toolbar content
    // offset CSS (data-kt-aside-minimize='on') remains correctly aligned.
    layout.setLayout({
      aside: currentUser
        ? {
            ...DefaultLayoutConfig.aside,
            minimized: sidebarState === 'collapsed',
          }
        : false,
      toolbar: showToolbar ? DefaultLayoutConfig.toolbar : false,
      extraToolbar: ExtraToolbar ? DefaultLayoutConfig.extraToolbar : false,
      hero: PageHero ? DefaultLayoutConfig.hero : false,
      outstandingBar: PageBar ? DefaultLayoutConfig.outstandingBar : false,
      content: {
        width: 'fluid',
      },
    });
  }, [
    showToolbar,
    fullPage,
    PageHero,
    PageBar,
    ExtraToolbar,
    currentUser,
    sidebarState,
  ]);

  useEffect(() => {
    if (AuthService.isAuthenticated() && !currentUser) {
      UsersService.refreshCurrentUser().catch(() => {});
    }
    UsersService.refreshImpersonatorUser();
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
      <ReviewCheck />
      <InvitationCheck />
      <PermissionDataProvider>
        <ProfileCompletenessProvider>
          <div className="d-flex flex-column flex-root print-content-only">
            {PageBar && <OutstandingBar>{PageBar}</OutstandingBar>}
            <div className="page d-flex flex-row flex-column-fluid">
              <UnifiedSidebar />
              <div className="wrapper d-flex flex-column flex-row-fluid">
                <CookiesConsent />
                {!state?.data?.hideHeader && (
                  <AppHeader hasBreadcrumbs={Boolean(breadcrumbs.length)} />
                )}
                <BreadcrumbMain mobile />
                <Announcements extraAnnouncement={ExtraAnnouncementBar} />
                <WarningBar />
                <OfferingUsersWarningBar />
                <RemovedProjectWarningBar />
                <GracePeriodWarningBar />
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
                    {state?.data?.auth && !currentUser ? (
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
        </ProfileCompletenessProvider>
      </PermissionDataProvider>
    </LayoutContext.Provider>
  );
};
