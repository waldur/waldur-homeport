import {
  ConfiguredSidebarStyle,
  isSidebarBackgroundDark,
  resolveSidebarStyle,
} from 'waldur-design-tokens';
import { QuickShortcutsMenu } from 'waldur-shell';
import { SidebarBrand } from 'waldur-ui';

import { getIconUrl } from '@/core/api';
import { ENV } from '@/core/config';
import { Link } from '@/core/Link';
import { translate } from '@/i18n';
import { useQuickShortcuts } from '@/navigation/useQuickShortcuts';
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
 * The quick shortcuts menu is waldur-shell's QuickShortcutsMenu, which the
 * micro-apps' AppShell uses too, listing useQuickShortcuts(). It renders its
 * trigger into SidebarBrand's `shortcutsButton` slot, so the menu anchors to
 * just that button. On mobile this row is not shown; AppHeader carries the
 * menu there.
 */
export const WaldurSidebarBrand = ({ onToggle }: WaldurSidebarBrandProps) => {
  const { theme } = useTheme();
  const configuredStyle = (ENV.plugins.WALDUR_CORE.SIDEBAR_STYLE ||
    'dark') as ConfiguredSidebarStyle;
  const sidebarTheme = resolveSidebarStyle(configuredStyle, theme);

  const { apps, links } = useQuickShortcuts();

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

  const logoAlt = translate('{title} logo', {
    title: ENV.plugins.WALDUR_CORE.SHORT_PAGE_TITLE,
  });

  const logo = (
    <Link state="profile.details">
      {ENV.plugins.WALDUR_CORE.SIDEBAR_LOGO_MOBILE && sidebarLogo ? (
        <>
          {/* Metronic's original collapsed-and-not-hovered aside
              behavior swaps to this compact mark when truly collapsed,
              not just hides the brand row outright —
              group-data-[collapsible=icon]/panel:block does the same swap here.
              Both logos hidden unconditionally would leave the collapsed rail
              with no brand mark at all. */}
          <img
            src={sidebarLogoMobileUrl}
            alt={logoAlt}
            className="hidden max-h-7 max-w-12 group-data-[collapsible=icon]/panel:block"
          />
          <img
            src={sidebarLogo}
            alt={logoAlt}
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
        // either) this visually hides in the collapsed rail rather than
        // rendering a truncated/oversized full wordmark into ~48px.
        <img
          src={sidebarLogo}
          alt={logoAlt}
          className="max-h-7 max-w-[190px] group-data-[collapsible=icon]/panel:sr-only"
        />
      ) : (
        <h3 className="m-0 truncate text-lg font-semibold text-[var(--nav-item-text)] group-data-[collapsible=icon]/panel:sr-only">
          {ENV.plugins.WALDUR_CORE.SHORT_PAGE_TITLE}
        </h3>
      )}
    </Link>
  );

  return (
    <QuickShortcutsMenu
      apps={apps}
      links={links}
      triggerClassName="group-data-[collapsible=icon]/panel:hidden"
    >
      {(trigger) => (
        <SidebarBrand
          logo={logo}
          onToggle={onToggle}
          shortcutsLabel={translate('Quick shortcuts')}
          shortcutsButton={trigger}
        />
      )}
    </QuickShortcutsMenu>
  );
};
