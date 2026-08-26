import { translate } from 'waldur-i18n-runtime';

import { Badge } from './Badge';
import { CopyButton } from './CopyButton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './DropdownMenu';
import { LanguageMenu, LanguageOption } from './LanguageMenu';
import { Switch } from './Switch';
import { Avatar } from './TopBar';

export interface CurrentUser {
  fullName: string;
  firstName: string;
  email: string;
  isStaff: boolean;
  imageSrc?: string;
  token?: string;
  ipAddress: string;
}

export interface UserMenuProps {
  currentUser: CurrentUser | null;
  /** Plain 'light' | 'dark' rather than importing waldur-design-tokens'
   * ThemeName — this package has no dependency on that package, and the
   * two types are structurally identical, so any ThemeName value is a
   * valid value here without a cast. */
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  currentLanguage: LanguageOption | undefined;
  languageChoices: LanguageOption[];
  onLanguageChange: (language: LanguageOption) => void;
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
 * toggle, API token, IP address). Originally a micro-app-poc-local file;
 * moved here once a second micro-app made "reusable, not duplicated"
 * matter — nothing about this component is specific to any one app, only
 * to the shape of a signed-in user, a theme, and a language list, all of
 * which arrive as props. See DropdownMenu.tsx's comments for why each
 * piece looks the way it does (LanguageMenu/RadioItem for the
 * org-switcher-shaped language list, the real toggle switch instead of a
 * checkmark, etc.) — this file only composes them.
 *
 * Calls translate() directly (waldur-i18n-runtime is now a real dependency
 * of this package, same as LanguageMenu.tsx) rather than taking a
 * pre-translated `labels` prop — see that file's comment on why the
 * package's earlier "no i18n dependency" boundary was dropped.
 */
export function UserMenu({
  currentUser,
  theme,
  onToggleTheme,
  currentLanguage,
  languageChoices,
  onLanguageChange,
}: UserMenuProps) {
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
        <DropdownMenuItem onClick={onToggleTheme}>
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
