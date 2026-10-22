/**
 * The floating-card drawers: DrawerRoot renders a drawer opened with one of
 * these `shellClass` values as a card under the header, without the page
 * overlay, and adds per-drawer touches (the chats' own scrolling, the
 * assistant's headerless controls). It also sets the value as the panel's
 * `data-shell`.
 *
 * Each value is referenced from two sites that MUST stay in sync:
 *  1. the header toggle's `isDrawerOpenWithClass(...)` open/close check, and
 *  2. the `open*` helper's `shellClass` drawer prop.
 *
 * Keeping the literals here means renaming one — or adding a new drawer —
 * touches one place instead of risking a missed site (which silently breaks
 * the toggle's close).
 */
export const DRAWER_SHELL_CLASS = {
  ai: 'ai-chat-drawer-active',
  support: 'support-drawer-active',
  confirmation: 'confirmation-drawer-active',
} as const;

export type DrawerShellClass =
  (typeof DRAWER_SHELL_CLASS)[keyof typeof DRAWER_SHELL_CLASS];
