import { BellIcon, QuestionIcon, SquaresFourIcon } from '@phosphor-icons/react';
import { ReactNode } from 'react';
import { ThemeName } from 'waldur-design-tokens';
import { LanguageOption, translate } from 'waldur-i18n-runtime';
import {
  CurrentUser,
  IconButton,
  SearchField,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  TopBar,
  UserMenu,
} from 'waldur-ui';

export interface AppShellProps {
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
  currentUser: CurrentUser | null;
  theme: ThemeName;
  onToggleTheme: () => void;
  currentLanguage: LanguageOption | undefined;
  languageChoices: LanguageOption[];
  onLanguageChange: (language: LanguageOption) => void;
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
 * UserMenu) — none of which varies by app, only by the data (current user,
 * theme, language) each app already fetches or computes for itself via
 * useShellTheme()/its own auth hook. Nav content, the sidebar's own header,
 * the org switcher, and all page content stay the caller's responsibility —
 * see each prop's own comment for why.
 *
 * Calls translate() directly for its own chrome strings (waldur-shell
 * already depends on waldur-i18n-runtime for loadSharedLocale()/
 * LanguageUtilsService, so this isn't a new dependency) — no labels prop.
 * UserMenu does the same internally now; see its own comment for why that
 * package's earlier "no i18n dependency" boundary was dropped.
 */
export function AppShell({
  sidebarHeader,
  sidebarContent,
  orgSwitcher,
  topBarCenter,
  onAppsClick,
  onHelpClick,
  onNotificationsClick,
  hasNotifications,
  currentUser,
  theme,
  onToggleTheme,
  currentLanguage,
  languageChoices,
  onLanguageChange,
  footer,
  children,
}: AppShellProps) {
  return (
    <SidebarProvider
      className="h-svh w-full text-[var(--surface-text-primary)]"
      style={{ backgroundColor: 'var(--surface-page-bg)' }}
    >
      <Sidebar>
        {sidebarHeader && <SidebarHeader>{sidebarHeader}</SidebarHeader>}
        <SidebarContent>{sidebarContent}</SidebarContent>
      </Sidebar>

      <SidebarInset className="min-h-0">
        <TopBar
          left={
            <>
              <SidebarTrigger />
              {orgSwitcher}
            </>
          }
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
              <UserMenu
                currentUser={currentUser}
                theme={theme}
                onToggleTheme={onToggleTheme}
                currentLanguage={currentLanguage}
                languageChoices={languageChoices}
                onLanguageChange={onLanguageChange}
              />
            </>
          }
        />

        <div className="flex flex-1 flex-col overflow-y-auto">{children}</div>
        {footer}
      </SidebarInset>
    </SidebarProvider>
  );
}
