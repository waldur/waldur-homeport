/**
 * Whether a drawer is docked beside the page rather than floating over it:
 * the user's choice per kind of drawer (its `shellClass`), remembered across
 * reloads as its width is (drawerWidth.ts).
 */

/**
 * The narrowest the page region (the window less the drawer, sidebar
 * included) may get beside a docked drawer: a phone's. Page content lays
 * itself out by that region's width (the `page-*` variants and hooks), and
 * the sidebar collapses to its rail as it narrows; narrower than this, the
 * drawer stays over the page instead.
 */
export const DOCK_MIN_PAGE_WIDTH = 576;

/**
 * The narrowest a docked drawer can be dragged to, whatever its own minimum:
 * beside the page, a narrow chat is the point. Floating again, it returns to
 * its own minimum.
 */
export const DOCKED_MIN_WIDTH = 400;

/** What a drawer's choice is remembered under. */
export const dockKey = (shellClass?: string) => shellClass ?? 'panel';

const storageKey = (key: string) => `waldur/drawer-docked/${key}`;

/**
 * The choice last made for this kind of drawer, or null for its default.
 * Storage can be unavailable (private windows, blocked site data); the drawer
 * then opens as its default says.
 */
export const readStoredDocked = (key: string): boolean | null => {
  try {
    const value = localStorage.getItem(storageKey(key));
    return value === null ? null : value === 'true';
  } catch {
    return null;
  }
};

export const storeDocked = (key: string, docked: boolean) => {
  try {
    localStorage.setItem(storageKey(key), String(docked));
  } catch {
    // Not remembered across reloads; the choice holds until then.
  }
};
