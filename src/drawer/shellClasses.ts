/**
 * Shell classes applied to `#kt_drawer` to turn the default Metronic panel into
 * a drawer-specific floating card (and hide the page overlay).
 *
 * Each class is referenced from two sites that MUST stay in sync:
 *  1. the header toggle's `isDrawerOpenWithClass(...)` open/close check, and
 *  2. the `open*` helper's `shellClass` drawer prop, which DrawerRoot renders.
 *
 * Never add one with `classList` — DrawerRoot owns #kt_drawer's className and
 * rewrites it whenever that changes, closing included.
 *
 * Keeping the literals here means renaming a class — or adding a new drawer —
 * touches one place instead of risking a missed site (which silently breaks the
 * toggle's close).
 *
 * NOTE: the matching CSS in `src/metronic/sass/custom/**` hardcodes these same
 * strings; keep them aligned when changing a value.
 */
export const DRAWER_SHELL_CLASS = {
  ai: 'ai-chat-drawer-active',
  support: 'support-drawer-active',
  confirmation: 'confirmation-drawer-active',
} as const;

export type DrawerShellClass =
  (typeof DRAWER_SHELL_CLASS)[keyof typeof DRAWER_SHELL_CLASS];
