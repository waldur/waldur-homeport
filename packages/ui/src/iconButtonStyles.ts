/**
 * Shared by TopBar.tsx's IconButton and Sidebar.tsx's SidebarTrigger — both
 * render a 36px (size-9) square icon-only button with the same hover
 * treatment (--surface-hover-bg, not --nav-item-hover-bg — see
 * DropdownMenu.tsx's comment on that same substitution: neither of these
 * lives inside the actual sidebar nav, so neither should pick up its
 * SIDEBAR_STYLE-driven color). Centralized so the two className strings
 * can't silently drift apart the next time either one changes — they
 * already had, byte-for-byte, before this existed.
 */
export const ICON_BUTTON_BASE_CLASSNAME =
  'flex size-9 items-center justify-center rounded-lg text-[var(--surface-text-secondary)] hover:bg-[var(--surface-hover-bg)]';
