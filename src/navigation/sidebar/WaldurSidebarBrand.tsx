import { ArrowSquareOutIcon, SquaresFourIcon } from '@phosphor-icons/react';
import * as RadixDropdownMenu from '@radix-ui/react-dropdown-menu';
import { useQuery } from '@tanstack/react-query';
import { externalLinksList } from 'waldur-js-client';

import {
  ConfiguredSidebarStyle,
  isSidebarBackgroundDark,
  resolveSidebarStyle,
} from 'waldur-design-tokens';
import {
  IconButton,
  SIDEBAR_ICON_BUTTON_CLASSNAME,
  SidebarBrand,
} from 'waldur-ui';

import { SHORTCUTS_QUERY_KEY } from '@/administration/quick-shortcuts/utils';
import { getIconUrl } from '@/core/api';
import Avatar from '@/core/Avatar';
import { ENV } from '@/core/config';
import { Link } from '@/core/Link';
import { translate } from '@/i18n';
import { useTheme } from '@/theme/useTheme';

interface WaldurSidebarBrandProps {
  onToggle?: () => void;
}

/**
 * The sidebar's top row — homeport's app-specific data (shortcuts query,
 * ENV-driven logo/title config) wired into waldur-ui's own SidebarBrand,
 * which owns the actual row layout (shortcuts slot, centered logo,
 * collapse toggle) and the collapsed-icon-rail/hover-expand behavior.
 *
 * The shortcuts button is passed via `shortcutsButton`, not
 * `onShortcutsClick`: it needs to be a RadixDropdownMenu.Trigger so the
 * menu anchors to just that button, not the whole brand row — a plain
 * onClick handed to SidebarBrand's own default button couldn't do that
 * (asChild would have to wrap the logo and collapse-toggle too, since
 * they're siblings inside the same row SidebarBrand renders).
 *
 * The dropdown *panel* itself keeps the app's existing generic Bootstrap
 * dropdown-menu/dropdown-item classes (same as every other
 * RadixDropdownMenu-based menu in the app, e.g. UserDropdownMenuItems) —
 * that styling system is unrelated to the aside/menu Metronic classes this
 * migration replaces, so it's left untouched.
 */
export const WaldurSidebarBrand = ({ onToggle }: WaldurSidebarBrandProps) => {
  const { theme } = useTheme();
  const configuredStyle = (ENV.plugins.WALDUR_CORE.SIDEBAR_STYLE ||
    'dark') as ConfiguredSidebarStyle;
  const sidebarTheme = resolveSidebarStyle(configuredStyle, theme);

  const { data: shortcutsResponse } = useQuery({
    queryKey: SHORTCUTS_QUERY_KEY,
    queryFn: () =>
      externalLinksList({ query: { page_size: 50 } }).then(
        (response) => response.data,
      ),
    refetchOnWindowFocus: false,
  });
  const shortcuts = shortcutsResponse || [];

  const sidebarLogoUrl = getIconUrl('sidebar_logo');
  const sidebarLogoMobileUrl = getIconUrl('sidebar_logo_mobile');
  const sidebarLogoDarkUrl = getIconUrl('sidebar_logo_dark');
  const sidebarLogo =
    isSidebarBackgroundDark(sidebarTheme) &&
    ENV.plugins.WALDUR_CORE.SIDEBAR_LOGO_DARK
      ? sidebarLogoDarkUrl
      : ENV.plugins.WALDUR_CORE.SIDEBAR_LOGO
        ? sidebarLogoUrl
        : undefined;

  const logo = (
    <Link state="profile.details">
      {ENV.plugins.WALDUR_CORE.SIDEBAR_LOGO_MOBILE && sidebarLogo ? (
        <>
          {/* Metronic's original [data-kt-aside-minimize='on']:not(:hover)
              behavior swaps to this compact mark when truly collapsed,
              not just hides the brand row outright —
              group-data-[collapsible=icon]/panel:block does the same swap here.
              Both logos hidden unconditionally would leave the collapsed rail
              with no brand mark at all. */}
          <img
            src={sidebarLogoMobileUrl}
            alt="logo"
            className="hidden max-h-7 max-w-12 group-data-[collapsible=icon]/panel:block"
          />
          <img
            src={sidebarLogo}
            alt="logo"
            // w-full, not just max-h-7 max-w-[190px] — the old Metronic
            // .logo class only caps max-height, leaving width auto so
            // the browser scales it to the image's own aspect ratio;
            // forcing width to 190px here independently of height
            // stretched every logo whose natural ratio doesn't happen
            // to match 190:28 (e.g. the real 148x27 brand logo became
            // 190x28 — visibly wider/flatter than intended).
            className="block max-h-7 max-w-[190px] group-data-[collapsible=icon]/panel:hidden"
          />
        </>
      ) : sidebarLogo ? (
        // No SIDEBAR_LOGO_MOBILE configured for this deployment — no
        // compact mark to swap to, so (like Metronic without one
        // either) this just hides in the collapsed rail rather than
        // rendering a truncated/oversized full wordmark into ~48px.
        <img
          src={sidebarLogo}
          alt="logo"
          className="max-h-7 max-w-[190px] group-data-[collapsible=icon]/panel:hidden"
        />
      ) : (
        <h3 className="m-0 truncate text-[18px] font-semibold text-[var(--nav-item-text)] group-data-[collapsible=icon]/panel:hidden">
          {ENV.plugins.WALDUR_CORE.SHORT_PAGE_TITLE}
        </h3>
      )}
    </Link>
  );

  return (
    <RadixDropdownMenu.Root modal={false}>
      <SidebarBrand
        logo={logo}
        onToggle={onToggle}
        shortcutsLabel={translate('Quick shortcuts')}
        shortcutsButton={
          shortcuts.length > 0 ? (
            <RadixDropdownMenu.Trigger asChild>
              <IconButton
                icon={<SquaresFourIcon size={24} weight="bold" />}
                label={translate('Quick shortcuts')}
                className={`${SIDEBAR_ICON_BUTTON_CLASSNAME} group-data-[collapsible=icon]/panel:hidden`}
              />
            </RadixDropdownMenu.Trigger>
          ) : null
        }
      />
      <RadixDropdownMenu.Portal>
        <RadixDropdownMenu.Content
          sideOffset={2}
          // position-static: same fix as ActionsDropdown.tsx's own
          // Content -- Bootstrap's .dropdown-menu hardcodes
          // position: absolute, which fights the Radix popper
          // wrapper (the actual positioned element here) and
          // collapses this panel's measured size.
          className="dropdown-menu show p-0 overflow-hidden position-static"
          style={{ minWidth: '400px' }}
        >
          {shortcuts.map((shortcut: any, index: number) => (
            <RadixDropdownMenu.Item key={shortcut.uuid} asChild>
              <a
                href={shortcut.link}
                target="_blank"
                rel="noopener noreferrer"
                className="dropdown-item d-flex align-items-center py-5 ps-6 pe-2 position-relative"
              >
                {/* Show separator line only if there are multiple items and not the last item */}
                {shortcuts.length > 1 && index < shortcuts.length - 1 && (
                  <div
                    className="position-absolute bottom-0 start-50 translate-middle-x border-bottom"
                    style={{ width: 'calc(100% - 24px)' }}
                  />
                )}
                <div className="me-5">
                  <Avatar
                    name={shortcut.name}
                    src={shortcut.image}
                    circle
                    size={42}
                  />
                </div>
                <div className="flex-grow-1 fs-4">
                  <div className="fw-bolder">{shortcut.name}</div>
                  {shortcut.description && (
                    <div className="fw-normal text-muted mt-3">
                      {shortcut.description}
                    </div>
                  )}
                </div>
                <div className="ms-2">
                  <span className="svg-icon svg-icon-primary svg-icon-1x">
                    <ArrowSquareOutIcon weight="bold" />
                  </span>
                </div>
              </a>
            </RadixDropdownMenu.Item>
          ))}
        </RadixDropdownMenu.Content>
      </RadixDropdownMenu.Portal>
    </RadixDropdownMenu.Root>
  );
};
