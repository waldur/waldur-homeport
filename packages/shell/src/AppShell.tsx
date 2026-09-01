import { BellIcon, QuestionIcon, SquaresFourIcon } from '@phosphor-icons/react';
import { ReactNode } from 'react';
import { translate } from 'waldur-i18n-runtime';
import {
  IconButton,
  SearchField,
  Sidebar,
  SidebarBrand,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  TopBar,
} from 'waldur-ui';

import { ShellErrorBoundary } from './ShellErrorBoundary';
import { CurrentUserProvider } from './useCurrentUser';
import { UserMenu } from './UserMenu';
import { ShellLanguageProvider } from './useShellLanguage';
import { ShellThemeProvider } from './useShellTheme';

export interface AppShellProps {
  /** Rendered centered in the sidebar's brand row (SidebarBrand), above
   * sidebarHeader — the app's or tenant's own logo, so it stays a slot
   * rather than a hardcoded Waldur mark. The row itself, and with it the
   * sidebar's collapse toggle, renders either way. */
  logo?: ReactNode;
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
  /** Defaults to a presentational SearchField — pass a different element,
   * or `null` to render nothing, for an app that needs its own search. */
  topBarCenter?: ReactNode | null;
  onAppsClick?: () => void;
  onHelpClick?: () => void;
  onNotificationsClick?: () => void;
  hasNotifications?: boolean;
  /** No default Waldur footer design exists yet (the real Bootstrap/Metronic
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
 * both the sidebar mockup and waldur-homeport's own real Metronic aside
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
  return (
    <CurrentUserProvider>
      <ShellThemeProvider>
        <ShellLanguageProvider>
          <AppShellContent {...props} />
        </ShellLanguageProvider>
      </ShellThemeProvider>
    </CurrentUserProvider>
  );
}

function AppShellContent({
  logo,
  onShortcutsClick,
  sidebarHeader,
  sidebarContent,
  orgSwitcher,
  topBarCenter,
  onAppsClick,
  onHelpClick,
  onNotificationsClick,
  hasNotifications,
  footer,
  children,
}: AppShellProps) {
  return (
    <SidebarProvider
      className="h-svh w-full text-[var(--surface-text-primary)]"
      style={{ backgroundColor: 'var(--surface-page-bg)' }}
    >
      <Sidebar>
        <SidebarHeader className="gap-4">
          <SidebarBrand
            logo={logo}
            onShortcutsClick={onShortcutsClick}
            shortcutsLabel={translate('Quick shortcuts')}
          />
          {sidebarHeader}
        </SidebarHeader>
        <SidebarContent>{sidebarContent}</SidebarContent>
      </Sidebar>

      <SidebarInset className="min-h-0">
        <TopBar
          left={orgSwitcher}
          center={
            topBarCenter === null
              ? undefined
              : (topBarCenter ?? (
                  <SearchField
                    placeholder={translate('Search')}
                    // '⌘K' isn't translatable content, just the universal
                    // shortcut-key convention — not worth a prop until an
                    // app actually needs a different one.
                    shortcutHint="⌘K"
                    className="hidden md:flex"
                  />
                ))
          }
          right={
            <>
              <IconButton
                icon={<SquaresFourIcon size={18} weight="bold" />}
                label={translate('Apps')}
                className="hidden sm:flex"
                onClick={onAppsClick}
              />
              <IconButton
                icon={<QuestionIcon size={18} weight="bold" />}
                label={translate('Help')}
                className="hidden sm:flex"
                onClick={onHelpClick}
              />
              <IconButton
                icon={<BellIcon size={18} weight="bold" />}
                label={translate('Notifications')}
                hasIndicator={hasNotifications}
                onClick={onNotificationsClick}
              />
              <UserMenu />
            </>
          }
        />

        <div className="flex flex-1 flex-col overflow-y-auto">
          <ShellErrorBoundary>{children}</ShellErrorBoundary>
        </div>
        {footer}
      </SidebarInset>
    </SidebarProvider>
  );
}
