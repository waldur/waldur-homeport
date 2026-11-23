import { useSyncExternalStore } from 'react';

/**
 * A History API router for this app's two levels: `projects/<uuid>/` picks
 * the project, the segment after it the section. The same small router as
 * apps/provider-calls (no router dependency in the workspace yet).
 */
export type SectionKey = 'overview' | 'models' | 'keys' | 'usage' | 'add';

const SECTION_SEGMENTS: Record<SectionKey, string> = {
  overview: '',
  models: 'models/',
  keys: 'keys/',
  usage: 'usage/',
  add: 'add/',
};

const SEGMENT_SECTIONS: Record<string, SectionKey> = {
  models: 'models',
  keys: 'keys',
  usage: 'usage',
  add: 'add',
};

const BASE = import.meta.env.BASE_URL; // '/' standalone, '/ai-inference/' under the portal
const NAVIGATE_EVENT = 'ai-inference:navigate';

export interface Route {
  /** Undefined on the app's root: the first project is shown. */
  projectUuid?: string;
  section: SectionKey;
}

/** The route a path under the app's base names (`projects/<uuid>/keys/`). */
export const parsePath = (path: string): Route => {
  const [first, projectUuid, section] = path.split('/').filter(Boolean);
  if (first !== 'projects' || !projectUuid) {
    return { section: 'overview' };
  }
  return { projectUuid, section: SEGMENT_SECTIONS[section] ?? 'overview' };
};

const parse = (): Route =>
  parsePath(
    window.location.pathname.startsWith(BASE)
      ? window.location.pathname.slice(BASE.length)
      : '',
  );

let current = parse();
const listeners = new Set<() => void>();

const refresh = () => {
  current = parse();
  listeners.forEach((listener) => listener());
};

window.addEventListener('popstate', refresh);
window.addEventListener(NAVIGATE_EVENT, refresh);

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const useRoute = () => useSyncExternalStore(subscribe, () => current);

export const sectionHref = (projectUuid: string, section: SectionKey) =>
  `${BASE}projects/${projectUuid}/${SECTION_SEGMENTS[section]}`;

/** Whether `href` is one of this app's pages, rather than the portal's. */
export const isAppHref = (href: string) => {
  const url = new URL(href, window.location.href);
  return url.origin === window.location.origin && url.pathname.startsWith(BASE);
};

export const navigate = (href: string) => {
  window.history.pushState(null, '', href);
  window.dispatchEvent(new Event(NAVIGATE_EVENT));
};

/** Same as navigate, without a history entry: for correcting the URL. */
export const replace = (href: string) => {
  window.history.replaceState(null, '', href);
  window.dispatchEvent(new Event(NAVIGATE_EVENT));
};

interface MouseEventLike {
  metaKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  button: number;
}

/** Click handler for an in-app `<a href>`: client-side unless modified. */
export const onLinkClick =
  (href: string) => (event: { preventDefault(): void } & MouseEventLike) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button > 0) {
      return;
    }
    event.preventDefault();
    navigate(href);
  };
