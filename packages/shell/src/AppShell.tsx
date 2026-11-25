import {
  BellIcon,
  ListIcon,
  QuestionIcon,
  SquaresFourIcon,
} from '@phosphor-icons/react';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { useBootSplashDismiss } from 'waldur-boot-splash/react';
import { translate } from 'waldur-i18n-runtime';
import { NotificationProvider } from 'waldur-notifications';
import type { RuntimeConfigData } from 'waldur-runtime-config';
import {
  ConfirmModalRoot,
  EmptyState,
  IconButton,
  ModalProvider,
  ModalRoot,
  Sidebar,
  SidebarBrand,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  TopBar,
  useSidebar,
} from 'waldur-ui';

import { whenMicroAppBootstrapped } from './bootstrap';
import {
  isMicroAppOffered,
  mergeFeatureFlags,
  useExternalLinks,
} from './microApps';
import { QuickShortcutsMenu, useAppShortcuts } from './QuickShortcutsMenu';
import { ShellErrorBoundary } from './ShellErrorBoundary';
import {
  CurrentUserProvider,
  useCurrentUser,
  useCurrentUserSettled,
} from './useCurrentUser';
import { UserMenu } from './UserMenu';
import { ShellLanguageProvider } from './useShellLanguage';
import { ShellThemeProvider } from './useShellTheme';

export interface AppShellProps {
  /** Rendered centered in the sidebar's brand row (SidebarBrand), above
   * sidebarHeader — the app's or tenant's own logo, so it stays a slot
   * rather than a hardcoded Waldur mark. The row itself, and with it the
   * sidebar's collapse toggle, renders either way. */
  logo?: ReactNode;
  /** The app's directory under apps/ (e.g. "provider-calls"). The quick
   * shortcuts menu leaves it out of its Apps group and offers the portal
   * instead, to get back. */
  appName?: string;
  /** Replaces the quick shortcuts menu (micro-apps, then the staff-managed
   * links) with a plain button calling this. */
  onShortcutsClick?: () => void;
  /** SidebarHeader content — e.g. a SidebarModeCard. App-specific: each
   * micro-app names and describes its own "current mode". */
  sidebarHeader?: ReactNode;
  /** SidebarSection/SidebarNavItem tree — app-specific nav structure. */
  sidebarContent: ReactNode;
  /** The already-built org/customer switcher (an OrgSwitcher + its menu
   * content) — org data is inherently app-specific, so this slot takes the
   * finished element rather than raw data, the same way TopBar's own
   * left/center/right slots do. Omit for an app with no org switcher. */
  orgSwitcher?: ReactNode;
  /** The top bar's middle: an app's own search or breadcrumbs. Empty by
   * default; `null` is accepted for the same. */
  topBarCenter?: ReactNode | null;
  /** Each top-bar button shows only for an app that passes its handler. */
  onAppsClick?: () => void;
  onHelpClick?: () => void;
  onNotificationsClick?: () => void;
  hasNotifications?: boolean;
  /** Where the user menu's "Log out" goes: the portal's logout page, which
   * signs out at the backend (and the identity provider, if any) and clears
   * the stored token. Omit, and the menu offers no "Log out". */
  logoutHref?: string;
  /** No default Waldur footer design exists yet (the
   * app has none either) — this is a structural slot for whenever one is,
   * not an extracted duplicate. Renders below the scrollable content area,
   * outside its overflow-y-auto, so it stays visible while content scrolls. */
  footer?: ReactNode;
  children: ReactNode;
}

/**
 * The chrome every micro-app shares: the Sidebar/TopBar/content-area layout
 * skeleton, plus TopBar's right-side cluster (Apps/Help/Notifications/
 * UserMenu). Current user, theme and language are no longer props — each is
 * constructed once inside AppShell itself (CurrentUserProvider/
 * ShellThemeProvider/ShellLanguageProvider, one per concern rather than a
 * single combined context, matching how each was already an independent
 * hook) since none of them need anything app-specific: theme/language read
 * shared storage/singletons bootstrapMicroApp() already wired up, and
 * currentUser is the same authenticated /users/me/ call regardless of which
 * micro-app is asking. An app that previously called useShellTheme() or an
 * app-local useCurrentUser() itself just to hand the result to this
 * component no longer needs to — see OrgDashboardMock.tsx. UserMenu itself
 * reads all three hooks directly (see its own comment) rather than
 * AppShellContent computing them just to pass them one level down — the
 * same three exported hooks (useCurrentUser/useShellTheme/useShellLanguage)
 * work the same way for any other page content nested inside children,
 * since they're all real descendants of these providers.
 *
 * The sidebar's brand row (SidebarBrand: quick-shortcuts button, logo
 * slot, collapse toggle) is part of that chrome and always renders, even
 * for an app that passes no logo and no sidebarHeader — it carries the
 * only collapse toggle now, so an app can't end up with a collapsed rail
 * it has no control to reopen. That toggle used to sit in the TopBar's
 * left slot instead; it moved next to the thing it collapses, matching
 * both the sidebar mockup and waldur-homeport's own sidebar
 * (src/navigation/sidebar/BrandName.tsx), whose header row has the same
 * three controls.
 *
 * Nav content, the sidebar's own header, the org switcher, and all page
 * content stay the caller's responsibility — see each remaining prop's own
 * comment for why those genuinely can't move in here the same way.
 * children is wrapped in ShellErrorBoundary (see its own comment): a crash
 * in one page's content shows a fallback there while the chrome around it
 * — Sidebar/TopBar/UserMenu — stays usable.
 *
 * Calls translate() directly for its own chrome strings (waldur-shell
 * already depends on waldur-i18n-runtime for loadSharedLocale()/
 * LanguageUtilsService, so this isn't a new dependency) — no labels prop.
 * UserMenu does the same internally now; see its own comment for why that
 * package's earlier "no i18n dependency" boundary was dropped.
 */
export function AppShell(props: AppShellProps) {
  // The boot splash stays until the app is bootstrapped, so the switch from
  // the default look to the tenant's brand, font and language happens behind
  // it; pages then show their own loading states.
  const [bootstrapped, setBootstrapped] = useState(false);
  const [runtimeConfig, setRuntimeConfig] = useState<RuntimeConfigData>();
  useEffect(() => {
    let mounted = true;
    void whenMicroAppBootstrapped().then((config) => {
      if (!mounted) return;
      setBootstrapped(true);
      setRuntimeConfig(config as RuntimeConfigData | undefined);
    });
    return () => {
      mounted = false;
    };
  }, []);
  useBootSplashDismiss(bootstrapped);
  return (
    <CurrentUserProvider>
      <ShellThemeProvider>
        <ShellLanguageProvider>
          <AppShellContent {...props} runtimeConfig={runtimeConfig} />
        </ShellLanguageProvider>
      </ShellThemeProvider>
    </CurrentUserProvider>
  );
}

/**
 * Opens the sidebar where it is a drawer. Below the sidebar's mobile
 * breakpoint the sidebar, collapse toggle (SidebarBrand) included, lives in
 * a closed Sheet, so without this nothing on screen can open it. Same
 * control as waldur-homeport's header toggle (AppHeader.tsx).
 */
function MobileSidebarToggle() {
  const { isMobile, openMobile, toggleSidebar } = useSidebar();
  if (!isMobile) return null;
  return (
    <IconButton
      label={translate('Toggle navigation menu')}
      aria-expanded={openMobile}
      onClick={toggleSidebar}
      icon={<ListIcon weight="bold" />}
      iconSize="lg"
      // Half a step into the bar's padding, as in waldur-homeport.
      className="-ms-[0.5rem]"
    />
  );
}

/** Where the app is served (Vite's BASE_URL), read without assuming the
 * app's tsconfig has Vite's client types. */
const appBaseUrl = () =>
  (import.meta as { env?: { BASE_URL?: string } }).env?.BASE_URL ?? '/';

function AppShellContent({
  logo,
  appName,
  onShortcutsClick,
  runtimeConfig,
  sidebarHeader,
  sidebarContent,
  orgSwitcher,
  topBarCenter,
  onAppsClick,
  onHelpClick,
  onNotificationsClick,
  hasNotifications,
  logoutHref,
  footer,
  children,
}: AppShellProps & { runtimeConfig?: RuntimeConfigData }) {
  const currentUser = useCurrentUser();
  const viewer = useMemo(
    () =>
      currentUser
        ? {
            isStaff: currentUser.isStaff,
            isSupport: currentUser.isSupport,
            roleNames: currentUser.roleNames,
            microApps: currentUser.microApps,
          }
        : null,
    [currentUser],
  );
  const features = useMemo(
    () => mergeFeatureFlags(runtimeConfig?.FEATURES, currentUser?.features),
    [runtimeConfig?.FEATURES, currentUser?.features],
  );
  const userSettled = useCurrentUserSettled();
  // The app is not offered to the signed-in user (switched off, or nobody
  // turned it on): say so rather than render pages whose menu entry the user
  // was never shown. Until
  // /users/me/ answers, an app's pages wait, so they neither flash nor start
  // their requests for a user the app turns out to be off for.
  const waitingForUser = Boolean(appName) && !userSettled;
  const offered = !viewer || isMicroAppOffered(appName, viewer, features);
  const appShortcuts = useAppShortcuts({
    baseUrl: appBaseUrl(),
    currentApp: appName,
    viewer,
    features,
    portalTitle: runtimeConfig?.plugins?.WALDUR_CORE?.SHORT_PAGE_TITLE,
  });
  const links = useExternalLinks(!onShortcutsClick && Boolean(currentUser));
  return (
    // The app's dialog host: page content opens dialogs with useModal() /
    // ModalService and confirm(), as in waldur-homeport, and the two roots
    // render them, with a crash inside one caught like a page's.
    <ModalProvider>
      {/* Standalone, not a wrapper — NotifyService/useNotify write to
          toastStore directly rather than through this subtree, the same
          way waldur-homeport's own NotificationContainer is a sibling of
          UIView rather than its ancestor. Every micro-app gets a working
          toast stack for free, matching ShellErrorBoundary below. */}
      <NotificationProvider />
      <SidebarProvider
        className="h-svh w-full text-primary"
        style={{ backgroundColor: 'var(--page-bg)' }}
      >
        <Sidebar>
          <SidebarHeader className="gap-4">
            {onShortcutsClick ? (
              <SidebarBrand
                logo={logo}
                onShortcutsClick={onShortcutsClick}
                shortcutsLabel={translate('Quick shortcuts')}
              />
            ) : (
              <QuickShortcutsMenu
                apps={appShortcuts}
                links={links}
                triggerClassName="group-data-[collapsible=icon]/panel:hidden"
              >
                {(trigger) => (
                  <SidebarBrand
                    logo={logo}
                    shortcutsButton={trigger}
                    shortcutsLabel={translate('Quick shortcuts')}
                  />
                )}
              </QuickShortcutsMenu>
            )}
            {sidebarHeader}
          </SidebarHeader>
          <SidebarContent>{sidebarContent}</SidebarContent>
        </Sidebar>

        <SidebarInset className="min-h-0">
          <TopBar
            left={
              <>
                <MobileSidebarToggle />
                {orgSwitcher}
              </>
            }
            // Only what works: an app's own search or breadcrumbs here, and
            // the Apps, Help and Notifications buttons only for an app that
            // handles them. A search field that searches nothing, or a button
            // that does nothing, is worse than none.
            center={topBarCenter ?? undefined}
            right={
              // TopBar leaves spacing between actions to the caller.
              <div className="flex items-center gap-2">
                {onAppsClick ? (
                  <IconButton
                    icon={<SquaresFourIcon size={18} weight="bold" />}
                    label={translate('Apps')}
                    className="hidden sm:flex"
                    onClick={onAppsClick}
                  />
                ) : null}
                {onHelpClick ? (
                  <IconButton
                    icon={<QuestionIcon size={18} weight="bold" />}
                    label={translate('Help')}
                    className="hidden sm:flex"
                    onClick={onHelpClick}
                  />
                ) : null}
                {onNotificationsClick ? (
                  <IconButton
                    icon={<BellIcon size={18} weight="bold" />}
                    label={translate('Notifications')}
                    hasIndicator={hasNotifications}
                    onClick={onNotificationsClick}
                  />
                ) : null}
                <UserMenu logoutHref={logoutHref} />
              </div>
            }
          />

          {/* The page scrolls here, below the top bar, so sticky page
              content (StepperLayout's column) sticks at this pane's top
              and is as tall as the pane: a size container, whose height
              `100cqh` then is. Size containment also makes the pane the
              containing block of `position: fixed` content inside it, so
              such content belongs in a portal (dialogs, menus and toasts
              already are). */}
          <div className="flex flex-1 flex-col overflow-y-auto [container-type:size] [--layout-sticky-top:0px] [--layout-sticky-height:100cqh]">
            <ShellErrorBoundary>
              {waitingForUser ? null : offered ? (
                children
              ) : (
                <EmptyState
                  className="m-auto"
                  title={translate('This app is not available to you')}
                  message={translate(
                    'Your administrator has not enabled it for your account.',
                  )}
                  data-testid="micro-app-not-available"
                />
              )}
            </ShellErrorBoundary>
          </div>
          {footer}
        </SidebarInset>
      </SidebarProvider>
      <ModalRoot errorBoundary={ShellErrorBoundary} />
      <ConfirmModalRoot errorBoundary={ShellErrorBoundary} />
    </ModalProvider>
  );
}
