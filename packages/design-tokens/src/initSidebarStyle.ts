import { ThemeName } from './theme';

export type SidebarStyle =
  'dark' | 'light' | 'primary' | 'accent' | 'accent-light';

/**
 * The full real ENV.plugins.WALDUR_CORE.SIDEBAR_STYLE value space
 * (src/SettingsDescription.ts's choice_field options) — one more than
 * SidebarStyle. 'auto' ("Match theme") isn't a sixth CSS-level style;
 * surfaceColors.css has no `[data-sidebar-style='auto']` rule, and never
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
 * Same 'auto' logic as the real src/navigation/sidebar/Sidebar.tsx's inline
 * computation: `configuredStyle === 'auto' ? (theme === 'dark' ? 'dark' :
 * 'light') : configuredStyle`. 'auto' isn't its own aside look — it's
 * "follow the page's light/dark toggle", which just picks between the two
 * styles (dark/light) whose Metronic source already flips per theme (see
 * surfaceColors.css's comment on the theme-inverted pair). Extracted as its
 * own function because, unlike the other four styles, this one has to be
 * re-run every time the page theme changes, not just once at config-load
 * time.
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
