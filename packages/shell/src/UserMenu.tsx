import { CopyIcon } from '@phosphor-icons/react';
import { translate } from 'waldur-i18n-runtime';
import {
  Avatar,
  Badge,
  buttonVariants,
  cn,
  LanguageMenu,
  Menu,
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
 * Menu, LanguageMenu, Avatar) from
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
/**
 * CopyButton's look (a small tertiary button with a copy icon) without the
 * button: inside a menu row that does the copying itself.
 */
function CopyButtonLook({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        buttonVariants({ variant: 'tertiary', size: 'sm' }),
        className,
      )}
    >
      <span className="inline-flex size-4 shrink-0 items-center justify-center [&>svg]:size-4">
        <CopyIcon weight="bold" />
      </span>
      {label}
    </span>
  );
}

export function UserMenu() {
  const currentUser = useCurrentUser();
  const { theme, toggleTheme } = useShellTheme();
  const { currentLanguage, languageChoices, onLanguageChange } =
    useShellLanguage();

  return (
    <Menu>
      <Menu.Trigger asChild>
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
                  shape="pill"
                  tone="outline"
                  className="mt-0.5 px-1.5 py-0"
                >
                  {translate('Staff')}
                </Badge>
              )}
            </div>
          )}
        </button>
      </Menu.Trigger>
      {/* The main app's user menu (UserDropdown.tsx): 275px wide, a header
          block, then the language row, the dark-theme toggle and the
          token/IP rows, split by separators. */}
      <Menu.Content
        align="end"
        className="py-[12px] text-[14px] font-medium w-[275px]"
      >
        {currentUser && (
          <>
            <div className="flex items-center px-[16.25px] py-[8px]">
              <Avatar
                className="me-[16.25px] size-[50px]"
                initials={getInitials(currentUser.fullName)}
                imageSrc={currentUser.imageSrc}
              />
              <div className="flex min-w-0 flex-col">
                {/* .fw-bolder fs-5 there: 15px, weight 600. */}
                <span className="truncate text-[14.95px] font-semibold text-[var(--surface-text-primary)]">
                  {currentUser.fullName}
                </span>
                {/* .text-muted fs-7 there: 12px, gray-500. */}
                <span className="truncate text-[12.35px] text-[var(--menu-item-muted-text)]">
                  {currentUser.email}
                </span>
              </div>
            </div>
            <Menu.Separator />
          </>
        )}
        {languageChoices.length > 0 && currentLanguage && (
          <>
            <LanguageMenu
              currentLanguage={currentLanguage}
              languageChoices={languageChoices}
              onLanguageChange={onLanguageChange}
            />
            <Menu.Separator />
          </>
        )}
        {/* As ThemeSwitcher.tsx's: a menuitemcheckbox showing a switch;
            choosing it keeps the menu open. */}
        <Menu.CheckboxItem
          checked={theme === 'dark'}
          onCheckedChange={toggleTheme}
          className="text-[var(--menu-item-strong-text)]"
        >
          {translate('Dark theme')}
        </Menu.CheckboxItem>
        {currentUser && <Menu.Separator />}
        {currentUser?.token && (
          // As UserToken.tsx: the label, a masked field and a Copy button,
          // as the look of one row that copies. The field and button are
          // hidden from screen readers (the token is a secret).
          <Menu.CopyItem
            value={currentUser.token}
            aria-label={translate('Copy API token')}
            copiedAnnouncement={translate('Copied')}
          >
            {(copied) => (
              <>
                <span className="me-[6.5px] whitespace-nowrap">
                  {translate('API token')}
                </span>
                <span
                  aria-hidden="true"
                  className="flex h-[30px] min-w-0 flex-1 items-center overflow-hidden whitespace-nowrap [contain:inline-size] rounded-md bg-[var(--menu-item-light-bg)] px-[9.75px] text-[12.025px] text-[var(--menu-item-strong-text)]"
                >
                  {'•'.repeat(currentUser.token.length)}
                </span>
                <CopyButtonLook
                  label={copied ? translate('Copied') : translate('Copy')}
                  className="ms-[6.5px]"
                />
              </>
            )}
          </Menu.CopyItem>
        )}
        {currentUser && (
          // As UserIpAddress.tsx: the label above the address and a Copy
          // button, as the look of one row that copies.
          <Menu.CopyItem
            value={currentUser.ipAddress}
            className="block"
            copiedAnnouncement={translate('Copied')}
          >
            {(copied) => (
              <>
                <span className="mb-[6.5px] block">
                  {translate('IP address')}:
                </span>
                <div className="flex items-center justify-between text-[var(--menu-item-muted-text)]">
                  <span>{currentUser.ipAddress}</span>
                  <CopyButtonLook
                    label={copied ? translate('Copied') : translate('Copy')}
                  />
                </div>
              </>
            )}
          </Menu.CopyItem>
        )}
      </Menu.Content>
    </Menu>
  );
}
