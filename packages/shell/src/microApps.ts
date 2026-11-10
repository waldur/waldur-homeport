import { useEffect, useState } from 'react';
// waldur-js-client is deliberately absent from this package's package.json —
// see the comment on the same import in packages/api-client/src/requestHelpers.ts.
import { ExternalLink, externalLinksList } from 'waldur-js-client';

/**
 * The micro-apps registry: what scripts/micro-apps-registry.mjs writes to
 * micro-apps.json from each app's package.json `waldur` block. The image
 * lists the apps it holds; the dev server lists every apps/* member.
 */
export interface MicroAppEntry {
  /** The app's directory under apps/, and its path under the portal. */
  name: string;
  title: string;
  description: string;
  visibleTo: {
    /** Feature flags ("section.key") that must all be on. */
    features: string[];
    /** Role names (e.g. "OFFERING.MANAGER") of which the user holds one;
     * empty for every signed-in user. Staff and support pass. */
    roles: string[];
    /** Staff and support only. */
    staffOnly: boolean;
  };
}

/** The feature flag that lists micro-apps at all. */
export const MICRO_APPS_FEATURE = 'user.show_micro_apps';

/** Runtime feature flags as the backend sends them: section → key → on. */
export type FeatureFlags = Record<string, Record<string, boolean>> | undefined;

const isFeatureOn = (features: FeatureFlags, feature: string) => {
  const [section, key] = feature.split('.');
  return Boolean(features?.[section]?.[key]);
};

export interface ShortcutsViewer {
  isStaff: boolean;
  isSupport?: boolean;
  /** The names of the roles the viewer holds now. */
  roleNames: string[];
}

/** Whether `viewer` is shown `app` in the quick shortcuts menu. */
export const isMicroAppVisible = (
  app: MicroAppEntry,
  viewer: ShortcutsViewer,
  features: FeatureFlags,
): boolean => {
  if (!isFeatureOn(features, MICRO_APPS_FEATURE)) return false;
  if (
    !app.visibleTo.features.every((feature) => isFeatureOn(features, feature))
  ) {
    return false;
  }
  const privileged = viewer.isStaff || Boolean(viewer.isSupport);
  if (app.visibleTo.staffOnly) return privileged;
  if (privileged || app.visibleTo.roles.length === 0) return true;
  return app.visibleTo.roles.some((role) => viewer.roleNames.includes(role));
};

/**
 * The portal's base path: the root app's own, or, from inside a micro-app
 * served at <portal>/<name>/, the path above it.
 */
export const portalBase = (baseUrl: string, currentApp?: string) =>
  currentApp && baseUrl.endsWith(`/${currentApp}/`)
    ? baseUrl.slice(0, -currentApp.length - 1)
    : baseUrl;

let registry: Promise<MicroAppEntry[]> | undefined;

/**
 * The registry, fetched once per page. Any failure (no file: a standalone
 * micro-app dev server; nginx's SPA fallback answering with index.html)
 * lists no apps rather than breaking the menu.
 */
export const fetchMicroApps = (base: string): Promise<MicroAppEntry[]> => {
  if (registry) return registry;
  const request: Promise<MicroAppEntry[]> = fetch(`${base}micro-apps.json`, {
    headers: { Accept: 'application/json' },
  })
    .then((response) => {
      if (
        !response.ok ||
        !response.headers.get('content-type')?.includes('application/json')
      ) {
        throw new Error('No micro-apps registry');
      }
      return response.json();
    })
    .then((data) => (Array.isArray(data?.apps) ? data.apps : []))
    .catch(() => {
      // Not kept: the next menu to mount asks again, so a blip on first
      // load, or an old pod answering mid-deploy, does not hide the apps
      // until a full reload.
      if (registry === request) registry = undefined;
      return [];
    });
  registry = request;
  return request;
};

/** Forgets the fetched registry, so the next fetch asks again. For tests. */
export const resetMicroAppsRegistry = () => {
  registry = undefined;
};

/** The deployment's micro-apps, fetched once; empty until they arrive. */
export const useMicroApps = (base: string) => {
  const [apps, setApps] = useState<MicroAppEntry[]>([]);
  useEffect(() => {
    let cancelled = false;
    fetchMicroApps(base).then((list) => {
      if (!cancelled) setApps(list);
    });
    return () => {
      cancelled = true;
    };
  }, [base]);
  return apps;
};

/**
 * The staff-managed quick links, for an app that does not hold them in its
 * own cache: the portal passes its react-query copy instead, which its
 * Administration → Quick shortcuts page refreshes.
 */
export const useExternalLinks = (enabled: boolean) => {
  const [links, setLinks] = useState<ExternalLink[]>([]);
  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    externalLinksList({ query: { page_size: 50 } })
      .then((response) => {
        if (!cancelled) setLinks(response.data ?? []);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [enabled]);
  return links;
};
