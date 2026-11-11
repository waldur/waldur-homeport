import { useEffect, useRef, useSyncExternalStore } from 'react';

/**
 * A History API router just big enough for this app's five flat pages: the
 * path picks the page, `?provider=` the provider. Kept local instead of adding
 * a router dependency while the app is a proof of concept; swap it for
 * react-router if the app grows nested routes or route-level data loading.
 */
export type PageKey =
  'inbox' | 'requests' | 'team' | 'proposals' | 'awards' | 'demand';

const PAGE_KEYS: PageKey[] = [
  'inbox',
  'requests',
  'team',
  'proposals',
  'awards',
  'demand',
];

const BASE = import.meta.env.BASE_URL; // '/' standalone, '/provider-calls/' under the portal
const NAVIGATE_EVENT = 'provider-calls:navigate';

interface Route {
  page: PageKey;
  /** The object a detail page shows: `proposals/<uuid>/` opens a proposal. */
  id?: string;
  params: URLSearchParams;
}

const parse = (): Route => {
  const path = window.location.pathname.startsWith(BASE)
    ? window.location.pathname.slice(BASE.length)
    : '';
  const [first, second] = path.split('/').filter(Boolean) as [
    PageKey | undefined,
    string | undefined,
  ];
  const page = first && PAGE_KEYS.includes(first) ? first : 'inbox';
  return {
    page,
    id: page === 'proposals' ? second : undefined,
    params: new URLSearchParams(window.location.search),
  };
};

/** Whether `href` is one of this app's pages, rather than the portal's. */
export const isAppHref = (href: string) => {
  const url = new URL(href, window.location.href);
  if (url.origin !== window.location.origin) {
    return false;
  }
  if (!url.pathname.startsWith(BASE)) {
    return false;
  }
  const first = url.pathname.slice(BASE.length).split('/').find(Boolean);
  return !first || PAGE_KEYS.includes(first as PageKey);
};

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

/** The URL of a page, keeping the selected provider unless `params` sets it. */
export const pageHref = (
  page: PageKey,
  params: Record<string, string | null | undefined> = {},
) => {
  const search = new URLSearchParams();
  const provider =
    'provider' in params ? params.provider : current.params.get('provider');
  if (provider) {
    search.set('provider', provider);
  }
  Object.entries(params).forEach(([key, value]) => {
    if (key !== 'provider' && value) {
      search.set(key, value);
    }
  });
  const query = search.toString();
  return `${BASE}${page === 'inbox' ? '' : `${page}/`}${query ? `?${query}` : ''}`;
};

/**
 * The current URL with one query parameter set, everything else kept: the
 * page, a proposal's uuid, the other parameters and the hash.
 */
export const withParam = (
  key: string,
  value: string,
  href = window.location.href,
) => {
  const url = new URL(href);
  url.searchParams.set(key, value);
  return `${url.pathname}${url.search}${url.hash}`;
};

/** Same as navigate, without a history entry: for correcting the URL. */
export const replace = (href: string) => {
  window.history.replaceState(null, '', href);
  window.dispatchEvent(new Event(NAVIGATE_EVENT));
};

/** One proposal, as the offering team sees it; `section` scrolls to a part. */
export const proposalHref = (proposalUuid: string, section?: string | null) => {
  const provider = current.params.get('provider');
  return `${BASE}proposals/${proposalUuid}/${provider ? `?provider=${provider}` : ''}${section ? `#${section}` : ''}`;
};

export const navigate = (href: string) => {
  window.history.pushState(null, '', href);
  window.dispatchEvent(new Event(NAVIGATE_EVENT));
};

/** Click handler for an in-app `<a href>`: client-side unless modified. */
export const onLinkClick =
  (href: string) => (event: { preventDefault(): void } & MouseEventLike) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button > 0) {
      return;
    }
    event.preventDefault();
    navigate(href);
  };

interface MouseEventLike {
  metaKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  button: number;
}

/** The id a hash names; null for none, or for a malformed escape (`#%E0`). */
export const sectionFromHash = (hash: string): string | null => {
  try {
    return decodeURIComponent(hash.slice(1)) || null;
  } catch {
    return null;
  }
};

/**
 * Scrolls to the element the URL's hash names once it is on the page. The
 * browser only tries on a full load, before the page's data has arrived, and
 * never on a client-side navigation, so a link to a section (an Inbox task's
 * step, say) would otherwise open at the top. Checked after every render
 * until the element appears; each hash is scrolled to once.
 */
export const useScrollToHash = () => {
  const done = useRef<string | null>(null);
  useEffect(() => {
    const id = sectionFromHash(window.location.hash);
    if (!id || done.current === id) {
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ block: 'start' });
      done.current = id;
    }
  });
};
