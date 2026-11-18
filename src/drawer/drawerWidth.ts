/**
 * Narrowest a resizable drawer gets unless it sets `minWidth`. Drawer
 * contents were only ever laid out at their default width or the full page
 * below lg, so a table toolbar or a form needs this much.
 */
export const DRAWER_MIN_WIDTH = 560;

/**
 * From this panel width the drawer contents lay out as in the expanded view
 * (the AI history sidebar, the script panel, the Team chat dock): a 320px
 * sidebar beside a conversation that still reads comfortably.
 */
export const DRAWER_WIDE_WIDTH = 1000;

/**
 * The width while a drag is under way, set on the panel by the resize handle
 * and read before `--drawer-width` (see DrawerRoot); null clears it. Like
 * getSidebarWidthStyle, a style object, so the property is declared where
 * the token audit looks for it.
 */
const getDragWidthStyle = (width: number | null): Record<string, string> => ({
  '--drawer-drag-width': width === null ? '' : `${width}px`,
});

export const setDragWidth = (panel: HTMLElement, width: number | null) => {
  Object.entries(getDragWidthStyle(width)).forEach(([name, value]) => {
    if (value) {
      panel.style.setProperty(name, value);
    } else {
      panel.style.removeProperty(name);
    }
  });
};

/** Keyboard step of the resize handle; Shift multiplies it by four. */
export const DRAWER_RESIZE_STEP = 32;

/**
 * Releasing a drag this close to the widest the drawer can get counts as
 * expanding it, so a drag to the edge behaves like the expand button.
 */
export const DRAWER_SNAP_DISTANCE = 16;

const storageKey = (key: string) => `waldur/drawer-width/${key}`;

/**
 * The width the user last dragged this drawer to, or null for its default.
 * Storage can be unavailable (private windows, blocked site data); the drawer
 * then just opens at its default width.
 */
export const readStoredDrawerWidth = (
  key: string | undefined,
  min: number,
): number | null => {
  if (!key) return null;
  try {
    const value = Number(localStorage.getItem(storageKey(key)));
    // A width stored before the drawer's minimum went up opens at the new one.
    return Number.isFinite(value) && value > 0 ? Math.max(value, min) : null;
  } catch {
    return null;
  }
};

export const storeDrawerWidth = (
  key: string | undefined,
  width: number | null,
) => {
  if (!key) return;
  try {
    if (width === null) {
      localStorage.removeItem(storageKey(key));
    } else {
      localStorage.setItem(storageKey(key), String(Math.round(width)));
    }
  } catch {
    // Not remembered across reloads; the width still applies until then.
  }
};

/**
 * The widest the drawer can get: the viewport beside the sidebar. The sidebar
 * publishes its width as a CSS expression (`--layout-sidebar-width`, see
 * useSidebarLayoutShim), so it is measured through a probe rather than parsed.
 */
export const measureMaxDrawerWidth = (min: number): number => {
  const probe = document.createElement('div');
  probe.style.cssText =
    'position:fixed;visibility:hidden;pointer-events:none;width:var(--layout-sidebar-width,0px)';
  document.body.appendChild(probe);
  const sidebar = probe.getBoundingClientRect().width;
  probe.remove();
  return Math.max(min, document.documentElement.clientWidth - sidebar);
};

export const clampDrawerWidth = (width: number, min: number, max: number) =>
  Math.min(Math.max(width, min), max);
