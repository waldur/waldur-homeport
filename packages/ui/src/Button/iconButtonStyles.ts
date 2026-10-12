/**
 * Shared by TopBar.tsx's IconButton and Sidebar.tsx's SidebarTrigger/
 * SidebarBrand — all render a 36px (size-9) square icon-only button.
 *
 * The --surface-* colors here are the TopBar's (--surface-hover-bg, not
 * --nav-item-hover-bg — see DropdownMenu.tsx's comment on that same
 * substitution). SidebarBrand's two buttons DO live inside the sidebar,
 * so they take this for size/shape only and override the color pair with
 * the --nav-item-* one; twMerge resolves that to the later class. Keeping
 * even that partial overlap centralized is the point — the strings had
 * already drifted byte-for-byte before this existed.
 */
export const ICON_BUTTON_BASE_CLASSNAME =
  'flex size-9 items-center justify-center rounded-lg text-[var(--surface-text-secondary)] hover:bg-[var(--surface-hover-bg)]';
