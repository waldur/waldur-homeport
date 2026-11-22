/**
 * Links into the main portal, for what this app leaves to it. Under the
 * portal (production, dev:subpath) the portal is this origin's root; on the
 * standalone dev server (base '/') it is VITE_ROOT_APP_URL.
 */
const UNDER_PORTAL = import.meta.env.BASE_URL !== '/';

export const ROOT_APP_URL: string = UNDER_PORTAL
  ? import.meta.env.BASE_URL.replace(/ai-inference\/$/, '')
  : import.meta.env.VITE_ROOT_APP_URL || '/';

const root = (path: string) => `${ROOT_APP_URL.replace(/\/$/, '')}${path}`;

/** A marketplace resource's full details page: every action and the history. */
export const portalResourceUrl = (resourceUuid: string) =>
  root(`/resource-details/${resourceUuid}/`);
