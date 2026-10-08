declare global {
  interface Window {
    /** Set by public/boot-redirect.js when it probes the default provider. */
    waldurBootRedirect?: Promise<boolean>;
  }
}

const RELOAD_KEY = 'waldur/boot/preload_reload_at';
const RELOAD_WINDOW_MS = 10_000;

let leaving = false;

/**
 * Resolves to true when public/boot-redirect.js has sent the visitor to the
 * identity provider, in which case the application must not boot at all.
 *
 * Firefox cancels the page's in-flight requests as soon as a navigation
 * starts, not when the next page arrives. An application booting alongside
 * the redirect therefore sees its lazy chunks fail, and the reload that
 * follows cancels the redirect — a loop that lasts until enough chunks are
 * cached to win the race.
 */
export async function isLeavingForIdentityProvider(
  win: Window = window,
): Promise<boolean> {
  leaving = (await win.waldurBootRedirect) === true;
  return leaving;
}

function readReloadAt(win: Window): number {
  try {
    return Number(win.sessionStorage.getItem(RELOAD_KEY)) || 0;
  } catch {
    return 0;
  }
}

function writeReloadAt(win: Window, value: number) {
  try {
    win.sessionStorage.setItem(RELOAD_KEY, String(value));
  } catch {
    // Without storage the loop guard is lost, the reload itself is not.
  }
}

/**
 * A lazy chunk that fails to load usually means a deployment replaced the
 * hashed assets under an open tab, and one reload fetches the new index.
 *
 * Not while the page is leaving: the failure is the cancelled navigation's
 * doing, and a reload would cancel the navigation. And not twice in a row:
 * if a reload did not help, another will not either, and reloading on every
 * failure is how a page ends up blinking forever. The error is left to the
 * error boundary, which offers its own Reload button.
 */
export function reloadAfterPreloadError(win: Window = window): boolean {
  if (leaving) {
    return false;
  }
  const now = Date.now();
  if (now - readReloadAt(win) < RELOAD_WINDOW_MS) {
    return false;
  }
  writeReloadAt(win, now);
  win.location.reload();
  return true;
}

/** For tests only. */
export function resetBootGuard() {
  leaving = false;
}
