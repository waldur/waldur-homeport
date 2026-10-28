import { UIView, useCurrentStateAndParams } from '@uirouter/react';
import classNames from 'classnames';
import React, {
  PropsWithChildren,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useSelector } from 'react-redux';

import {
  BreadcrumbLinkRenderer,
  BreadcrumbsProvider,
  cn,
  SidebarProvider,
  useBreadcrumbItems,
  useBreakpointDown,
  useSidebar,
} from 'waldur-ui';

import { ImpersonationBar } from '@/administration/ImpersonationBar';
import * as AuthService from '@/auth/AuthService';
import {
  PermissionDataProvider,
  PermissionLayout,
} from '@/auth/PermissionLayout';
import WarningBar from '@/auth/WarningBar';
import { GRID_BREAKPOINTS } from '@/core/constants';
import { Link } from '@/core/Link';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { useIsFloatingDrawerOpen } from '@/drawer/actions';
import { FeedbackPromptCheck } from '@/feedback/FeedbackPromptCheck';
import { InvitationCheck } from '@/invitations/InvitationCheck';
import { PAGE_CONTAINER_CLASSNAME } from '@/navigation/pageContainer';
import { GracePeriodWarningBar } from '@/project/GracePeriodWarningBar';
import { RemovedProjectWarningBar } from '@/project/RemovedProjectWarningBar';
import { OfferingUsersWarningBar } from '@/user/OfferingUsersWarningBar';
import { ProfileCompletenessProvider } from '@/user/ProfileCompletenessContext';
import { UsersService } from '@/user/UsersService';
import { useUser } from '@/workspace/hooks';
import { ReviewCheck } from '@/workspace/ReviewCheck';
import { getImpersonatorUser } from '@/workspace/selectors';

import { useChromeHeights } from './chromeHeights';
import { LayoutContext, LayoutContextInterface } from './context';
import { CookiesConsent } from './cookies/CookiesConsent';
import { AppFooter } from './footer/AppFooter';
import { Announcements } from './header/announcements/Announcements';
import { AppHeader } from './header/AppHeader';
import { BreadcrumbMain } from './header/breadcrumb/BreadcrumbMain';
import { OutstandingBar } from './OutstandingBar';
import { UnifiedSidebar } from './sidebar/UnifiedSidebar';
import { LayoutSlotsProvider, useLayoutSlots } from './slots';
import { Tab } from './Tab';
import { Toolbar } from './Toolbar';
import { useTabs } from './useTabs';

// A crumb's `to` is a UI-Router state name. The app's Link also conceals links
// to states this deployment has disabled.
const renderStateLink: BreadcrumbLinkRenderer = (to, params) => (
  <Link state={to} params={params} />
);

export const Layout: React.FC<PropsWithChildren> = ({ children }) => (
  <SidebarProvider
    renderWrapper={false}
    mobileBreakpoint={GRID_BREAKPOINTS.lg}
    style={{ '--sidebar-width-icon': '75px' } as React.CSSProperties}
  >
    <BreadcrumbsProvider renderLink={renderStateLink}>
      <LayoutContent>{children}</LayoutContent>
    </BreadcrumbsProvider>
  </SidebarProvider>
);

const LayoutContent: React.FC<PropsWithChildren> = ({ children }) => {
  const { state } = useCurrentStateAndParams();
  const currentUser = useUser();
  const impersonatorUser = useSelector(getImpersonatorUser);
  const breadcrumbs = useBreadcrumbItems();
  const [extraTabs, setExtraTabs] = useState<Tab[]>([]);
  const [fullPage, setFullPage] = useState(false);
  // What pages render into the chrome (LayoutSlot), and which slots are
  // filled.
  const { value: slots, slotRef, filled } = useLayoutSlots();
  const hasHero = filled('hero');
  const hasActions = filled('actions');
  const hasFilters = filled('filters');
  const { setOpenMobile } = useSidebar();

  useEffect(() => {
    setOpenMobile(false);
  }, [state, setOpenMobile]);

  const context = useMemo<Partial<LayoutContextInterface>>(
    () => ({
      extraTabs,
      setExtraTabs,
      fullPage,
      setFullPage,
    }),
    [extraTabs, setExtraTabs, fullPage, setFullPage],
  );

  const tabs = useTabs();

  const showToolbar = Boolean(
    hasActions || tabs?.length > 1 || extraTabs?.length,
  );

  const showPageTabs = Boolean(showToolbar || hasFilters);

  // The chrome stays in the page flow and sticks: the impersonation bar to
  // the top, the header group under it, and the page tabs under the header,
  // straight away or, under a hero, once the hero has scrolled away. Their
  // measured heights become the CSS variables sticky content positions
  // itself by (chromeHeights.ts).
  const pageBarRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const breadcrumbBarRef = useRef<HTMLDivElement>(null);
  const pageTabsRef = useRef<HTMLDivElement>(null);
  // The phone breadcrumb bar shows below md while the page has a trail.
  const breadcrumbBar = useBreakpointDown('md') && breadcrumbs.length > 0;
  useChromeHeights(
    {
      pageBar: pageBarRef,
      header: headerRef,
      breadcrumbBar: breadcrumbBarRef,
      pageTabs: pageTabsRef,
    },
    [impersonatorUser, breadcrumbBar, showPageTabs, hasHero],
  );

  // A floating drawer (z 110, --z-index-mobile-drawer) sits over the page
  // under the header; lift the header one above it while one is open, so the
  // header's menus, which open down into the drawer's band, are not painted
  // behind it.
  const floatingDrawerOpen = useIsFloatingDrawerOpen();

  const pageTabs = showPageTabs && (
    <div
      ref={pageTabsRef}
      className={classNames(
        'sticky z-99 print:hidden',
        // Overlaps the header's bottom rule, as the header group overlaps
        // whatever follows it.
        'top-[calc(var(--layout-page-bar-height,0px)+var(--layout-header-height,0px)+var(--layout-breadcrumb-bar-height,0px)-1px)]',
      )}
    >
      {showToolbar && (
        <Toolbar actionsRef={hasActions ? slotRef.actions : undefined} />
      )}
      {hasFilters && (
        <div
          ref={slotRef.filters}
          // The filter bar under the page tabs; the waldur-integration-testing
          // suite selects it by its test id (docs/e2e-locators.md).
          data-testid="filter-bar"
          className="h-[44px] border-b-[1px] border-b-secondary *:h-full *:items-center *:content-center"
        />
      )}
    </div>
  );

  useEffect(() => {
    if (AuthService.isAuthenticated() && !currentUser) {
      UsersService.refreshCurrentUser().catch(() => {});
    }
    UsersService.refreshImpersonatorUser();
  }, []);

  return (
    <LayoutContext.Provider value={context}>
      <LayoutSlotsProvider value={slots}>
        <ReviewCheck />
        <InvitationCheck />
        <PermissionDataProvider>
          <ProfileCompletenessProvider>
            <FeedbackPromptCheck />
            <div
              // Printing shows the page without its controls: every button in
              // it is hidden.
              className="flex flex-col flex-1 print:[&_button]:hidden!"
              // SidebarLayout's sticky sidebar sizes itself differently under page tabs.
              data-page-tabs={showToolbar ? '' : undefined}
            >
              {impersonatorUser && (
                <OutstandingBar ref={pageBarRef}>
                  <ImpersonationBar />
                </OutstandingBar>
              )}
              <div className="flex flex-row grow shrink-0">
                <UnifiedSidebar />
                <div className="flex flex-col flex-auto min-w-0">
                  <CookiesConsent />
                  <div
                    ref={headerRef}
                    className={classNames(
                      // -mb-px: what follows starts under the group's bottom
                      // rule, as it did under the fixed header.
                      'sticky top-[var(--layout-page-bar-height,0px)] -mb-px print:hidden',
                      floatingDrawerOpen ? 'z-[111]' : 'z-header',
                    )}
                  >
                    <AppHeader hasBreadcrumbs={Boolean(breadcrumbs.length)} />
                  </div>
                  <BreadcrumbMain mobile ref={breadcrumbBarRef} />
                  {!hasHero && pageTabs}
                  <Announcements extraRef={slotRef.announcements} />
                  <WarningBar />
                  <OfferingUsersWarningBar />
                  <RemovedProjectWarningBar />
                  <GracePeriodWarningBar />
                  <div
                    // The page content under the chrome; also the hook
                    // BillingDetails.scss prints the invoice from.
                    data-slot="page-content"
                    className={classNames(
                      'flex flex-col grow',
                      // A hero or a full-page view runs edge to edge; other
                      // pages get the content spacing above and below.
                      hasHero || fullPage
                        ? 'p-[0px]'
                        : 'py-[15px] lg:py-[32px]',
                    )}
                  >
                    {hasHero && (
                      <div
                        ref={slotRef.hero}
                        className="hero w-full flex flex-col"
                      />
                    )}
                    {hasHero && pageTabs}
                    <div
                      className={classNames(
                        'w-full flex grow shrink-0',
                        hasHero && !fullPage && 'py-[1.24rem]',
                      )}
                    >
                      {state?.data?.auth && !currentUser ? (
                        <LoadingSpinner />
                      ) : (
                        children
                      )}
                      <div
                        // Also the portal target TableFiltersMenu looks up.
                        id="kt_content_container"
                        // A full-page view drops the container's side padding;
                        // cn() so its p-[0px] replaces the container's px-*.
                        className={cn(
                          PAGE_CONTAINER_CLASSNAME,
                          fullPage && 'p-[0px] lg:p-[0px]',
                        )}
                      >
                        <PermissionLayout>
                          <UIView />
                        </PermissionLayout>
                      </div>
                    </div>
                  </div>
                  <AppFooter />
                </div>
              </div>
            </div>
          </ProfileCompletenessProvider>
        </PermissionDataProvider>
      </LayoutSlotsProvider>
    </LayoutContext.Provider>
  );
};
