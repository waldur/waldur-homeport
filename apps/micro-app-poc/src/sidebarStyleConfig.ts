import { ConfiguredSidebarStyle } from 'waldur-design-tokens';

/**
 * The one raw ENV.plugins.WALDUR_CORE.SIDEBAR_STYLE value ('auto' included)
 * that two otherwise-unrelated places both need: App.tsx's
 * fetchRuntimeConfig() effect sets it once at boot, OrgDashboardMock.tsx's
 * theme toggle re-reads it on every toggle to decide whether the sidebar
 * needs to follow (only 'auto' does — see resolveSidebarStyle() in
 * waldur-design-tokens). A plain module export rather than prop-drilling
 * through App down to OrgDashboardMock, or React context for a value that
 * changes at most once per session and is read by exactly one call site.
 */
export let configuredSidebarStyle: ConfiguredSidebarStyle = 'dark';

// A live-binding `let` export can't be assigned from outside its own
// module (ESM import bindings are read-only views) — this setter is the
// module's own write access, called by App.tsx once its config fetch
// resolves.
export function setConfiguredSidebarStyle(value: ConfiguredSidebarStyle) {
  configuredSidebarStyle = value;
}
