import { ThemeName } from './theme';

export type SidebarStyle =
  'dark' | 'light' | 'primary' | 'accent' | 'accent-light';

/**
 * The full real ENV.plugins.WALDUR_CORE.SIDEBAR_STYLE value space
 * (src/SettingsDescription.ts's choice_field options) — one more than
 * SidebarStyle. 'auto' ("Match theme") isn't a sixth CSS-level style;
 * sidebarColors.css has no `[data-sidebar-style='auto']` rule, and never
 * should — see resolveSidebarStyle().
 */
export type ConfiguredSidebarStyle = SidebarStyle | 'auto';

/**
 * Mirrors `style` onto `target`'s data-sidebar-style attribute, the signal
 * surfaceColors.css's --nav-item-* and --surface-sidebar-bg tokens key off
 * via `[data-sidebar-style='...']` (see that file's comment for the full
 * Metronic $asides cross-reference). Takes the resolved style as a plain
 * argument rather than reading ENV.plugins.WALDUR_CORE.SIDEBAR_STYLE
 * itself — same reasoning as initFontFamily()/initBrandTokens(): callers
 * own where their config comes from and stay the single source of truth.
 */
export function applySidebarStyle(
  style: SidebarStyle,
  target: HTMLElement = document.documentElement,
) {
  target.setAttribute('data-sidebar-style', style);
}

/**
 * 'auto' isn't its own aside look — it's "make the sidebar visually track
 * the page's light/dark toggle", which just picks whichever of the two
 * theme-named styles matches. This used to be more complicated: an earlier
 * version of sidebarColors.css gave 'dark'/'light' a second block that
 * *inverted* each under `[data-theme='dark']` (a mistaken port of a
 * Metronic quirk that didn't actually apply here — see that file's own
 * comment), which made this straightforward mapping select the visually
 * *wrong* style. Now that sidebarColors.css's five styles are all fixed,
 * unconditional looks (matching "primary"/"accent"/"accent-light", which
 * were never inverted), this plain mapping is correct again.
 */
export function resolveSidebarStyle(
  configured: ConfiguredSidebarStyle,
  theme: ThemeName,
): SidebarStyle {
  if (configured !== 'auto') {
    return configured;
  }
  return theme === 'dark' ? 'dark' : 'light';
}

/**
 * Whether a resolved sidebar style renders a dark background — for a
 * consumer picking between light/dark logo assets (WaldurSidebarBrand.tsx's
 * SIDEBAR_LOGO_DARK swap), not just setting the CSS attribute. 'primary'
 * and 'accent-light' are deliberately excluded, matching this check's
 * pre-existing scope (the dark-logo swap was never wired up for those two).
 * No theme parameter: now that sidebarColors.css's styles are all fixed
 * (see resolveSidebarStyle()'s own comment), which one renders dark no
 * longer depends on the app's own light/dark theme.
 */
export function isSidebarBackgroundDark(resolved: SidebarStyle): boolean {
  return resolved === 'dark' || resolved === 'accent';
}
