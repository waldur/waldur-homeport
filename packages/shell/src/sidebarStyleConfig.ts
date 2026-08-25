import { ConfiguredSidebarStyle } from 'waldur-design-tokens';

/**
 * The one raw ENV.plugins.WALDUR_CORE.SIDEBAR_STYLE value ('auto' included)
 * that two otherwise-unrelated places both need: bootstrapAppShellAsync()
 * sets it once at boot, useShellTheme()'s toggle re-reads it on every
 * toggle to decide whether the sidebar needs to follow (only 'auto' does —
 * see resolveSidebarStyle() in waldur-design-tokens). A plain module export
 * rather than prop-drilling from bootstrap through to the theme hook, or
 * React context for a value that changes at most once per session and is
 * read by exactly one call site. Private to this package — nothing outside
 * bootstrap.ts/useShellTheme.ts needs it.
 */
export let configuredSidebarStyle: ConfiguredSidebarStyle = 'dark';

// A live-binding `let` export can't be assigned from outside its own
// module (ESM import bindings are read-only views) — this setter is the
// module's own write access, called by bootstrapAppShellAsync() once its
// config fetch resolves.
export function setConfiguredSidebarStyle(value: ConfiguredSidebarStyle) {
  configuredSidebarStyle = value;
}

const CONFIGURED_SIDEBAR_STYLES: readonly ConfiguredSidebarStyle[] = [
  'dark',
  'light',
  'primary',
  'accent',
  'accent-light',
  'auto',
];

/**
 * ENV.plugins.WALDUR_CORE.SIDEBAR_STYLE is typed as a plain `string` in the
 * main app's own src/auth/types.ts, not a union, so a stale/typo'd backend
 * value shouldn't set an attribute surfaceColors.css has no rule for
 * (which would fall through to the unstyled shadcn defaults).
 */
export function isConfiguredSidebarStyle(
  value: string,
): value is ConfiguredSidebarStyle {
  return (CONFIGURED_SIDEBAR_STYLES as readonly string[]).includes(value);
}
