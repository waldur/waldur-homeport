import { translate } from 'waldur-i18n-runtime';
import {
  Avatar,
  Badge,
  CopyButton,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  LanguageMenu,
  Switch,
} from 'waldur-ui';

import { useCurrentUser } from './useCurrentUser';
import { useShellLanguage } from './useShellLanguage';
import { useShellTheme } from './useShellTheme';

export interface CurrentUser {
  fullName: string;
  firstName: string;
  email: string;
  isStaff: boolean;
  imageSrc?: string;
  token?: string;
  ipAddress: string;
}

// Same acronym derivation as src/core/Avatar.tsx's real Avatar component —
// not a fabricated placeholder, so a two-letter initials fallback is never
// shown for a real name it doesn't actually match.
function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * UserDropdownMenu.tsx's real component — TopBar's avatar trigger plus
 * its full dropdown content (header block, language switcher, dark-theme
 * toggle, API token, IP address). Originally a micro-app-poc-local file,
 * then a waldur-ui one once a second micro-app made "reusable, not
 * duplicated" matter; moved again into waldur-shell once AppShell started
 * constructing currentUser/theme/language itself (see AppShell.tsx's own
 * comment) — this component is really shell chrome, not a general-purpose
 * UI primitive, so it belongs next to the providers that feed it rather
 * than in the primitives package. Imports every piece it composes (Badge,
 * CopyButton, the DropdownMenu family, LanguageMenu, Switch, Avatar) from
 * waldur-ui, a dependency waldur-shell already has.
 *
 * Takes no props — reads useCurrentUser()/useShellTheme()/
 * useShellLanguage() directly instead of AppShellContent computing all
 * three just to hand them straight back down one level (the exact
 * passthrough these hooks/providers were built to eliminate; see
 * AppShell.tsx's own comment). Only works as a descendant of <AppShell>,
 * same requirement each of those hooks already documents on its own.
 *
 * Calls translate() directly (waldur-i18n-runtime is a dependency of this
 * package too, same as useShellLanguage.tsx) rather than taking a
 * pre-translated `labels` prop — see waldur-ui's LanguageMenu.tsx comment
 * on why that package's earlier "no i18n dependency" boundary was dropped;
 * the same reasoning applies here.
 */
export function UserMenu() {
  const currentUser = useCurrentUser();
  const { theme, toggleTheme } = useShellTheme();
  const { currentLanguage, languageChoices, onLanguageChange } =
    useShellLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className="flex items-center gap-2">
          <Avatar
            // size-9 (36px), not AvatarRoot's own size-8 default — splits
            // the difference of Metronic's real responsive
            // symbol-30px/symbol-md-40px, which this app has no matching
            // breakpoint pair for.
            className="size-9"
            initials={currentUser ? getInitials(currentUser.fullName) : 'MS'}
            imageSrc={currentUser?.imageSrc}
          />
          {currentUser && (
            // Same structure as UserDropdownMenu.tsx's real header
            // trigger: "Hello" only for a non-staff user, a "Staff" pill
            // only for one — never both. Hidden below md, same breakpoint
            // that component uses (d-none d-md-flex).
            <div className="hidden flex-col items-start md:flex">
              {!currentUser.isStaff && (
                <span className="text-xs text-[var(--surface-text-muted)]">
                  {translate('Hello')}
                </span>
              )}
              {/* font-medium (500), not font-bold (700) — real
                  UserDropdown.tsx:46's trigger name is "fs-base fw-bold",
                  and this app's Metronic build overrides
                  $font-weight-bold to 500 (Bootstrap's own default is
                  700). See StatCard.tsx's comment on the same weight
                  scale for the SCSS source. */}
              <span className="text-sm font-medium text-[var(--surface-text-primary)]">
                {currentUser.firstName}
              </span>
              {currentUser.isStaff && (
                // Metronic's real Staff badge is
                // `<Badge variant="purple" outline pill>`
                // (UserDropdownMenu.tsx) — now a direct, real Badge
                // variant/tone/pill combination (see badgeColors.css),
                // not a hand-rolled color override the way it was before
                // Badge grew a real variant/tone system.
                <Badge
                  variant="purple"
                  tone="outline"
                  pill
                  className="mt-0.5 px-1.5 py-0"
                >
                  {translate('Staff')}
                </Badge>
              )}
            </div>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-64">
        {currentUser && (
          <>
            {/* Same header block as UserDropdownMenu.tsx's real dropdown
                content — a bigger avatar (symbol-50px there) plus
                full_name and email (a profile link there; plain text
                here, no profile route to link to). */}
            <div className="flex items-center gap-3 px-2 py-1.5">
              <Avatar
                className="size-12"
                initials={getInitials(currentUser.fullName)}
                imageSrc={currentUser.imageSrc}
              />
              <div className="flex min-w-0 flex-col">
                {/* font-semibold (600), not font-bold (700) — real
                    UserDropdown.tsx's dropdown-content display name uses
                    .fw-bolder, not .fw-bold (see the trigger name's own
                    comment above for the weight-scale source); .fw-bolder
                    resolves to 600 in this app's Metronic build. */}
                <span className="truncate text-sm font-semibold text-[var(--surface-text-primary)]">
                  {currentUser.fullName}
                </span>
                <span className="truncate text-xs text-[var(--surface-text-muted)]">
                  {currentUser.email}
                </span>
              </div>
            </div>
            <DropdownMenuSeparator />
          </>
        )}
        {languageChoices.length > 0 && currentLanguage && (
          <>
            <LanguageMenu
              currentLanguage={currentLanguage}
              languageChoices={languageChoices}
              onLanguageChange={onLanguageChange}
            />
            <DropdownMenuSeparator />
          </>
        )}
        {/* ThemeSwitcher.tsx's real menu item is an AwesomeCheckbox
            labeled "Dark theme" — a real toggle switch, not a checkmark
            (see Switch.tsx). The whole row toggles via DropdownMenuItem's
            own onClick, same as every other item in this menu, so the
            Switch here is purely a visual reflection of `theme`
            (pointer-events-none) — wiring its own onCheckedChange too
            would double-toggle when a click on it bubbles up to the row
            anyway. */}
        <DropdownMenuItem onClick={toggleTheme}>
          {translate('Dark theme')}
          <Switch
            checked={theme === 'dark'}
            onCheckedChange={() => {}}
            tabIndex={-1}
            className="pointer-events-none ml-auto"
          />
        </DropdownMenuItem>
        {currentUser?.token && (
          <>
            <DropdownMenuSeparator />
            <div className="flex flex-col gap-1.5 px-2 py-1.5">
              <span className="text-xs font-medium text-[var(--surface-text-muted)]">
                {translate('API token')}
              </span>
              <div className="flex items-center gap-1.5">
                <input
                  type="password"
                  readOnly
                  value={currentUser.token}
                  className="min-w-0 flex-1 rounded-md border border-[var(--surface-card-border)] bg-[var(--surface-page-bg)] px-2 py-1 text-sm text-[var(--surface-text-primary)]"
                />
                <CopyButton
                  value={currentUser.token}
                  label={translate('Copy')}
                  copiedLabel={translate('Copied')}
                />
              </div>
            </div>
          </>
        )}
        {currentUser && (
          <>
            <DropdownMenuSeparator />
            <div className="flex flex-col gap-1.5 px-2 py-1.5">
              <span className="text-xs font-medium text-[var(--surface-text-muted)]">
                {translate('IP address')}
              </span>
              <div className="flex items-center justify-between gap-1.5">
                <span className="text-sm text-[var(--surface-text-muted)]">
                  {currentUser.ipAddress}
                </span>
                <CopyButton
                  value={currentUser.ipAddress}
                  label={translate('Copy')}
                  copiedLabel={translate('Copied')}
                />
              </div>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
