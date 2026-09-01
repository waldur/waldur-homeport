import { ENV } from '@/core/config';

export const hasSupport = () => !!ENV.plugins.WALDUR_SUPPORT?.ENABLED;

export const hasProviderRouting = () =>
  !!ENV.plugins.WALDUR_SUPPORT?.PROVIDER_ROUTING_ENABLED;

/** The built-in helpdesk: Waldur owns the ticket lifecycle rather than a
 * remote service desk, so there is nothing to sync from. */
export const isBasicSupportBackend = () =>
  ENV.plugins.WALDUR_SUPPORT?.ACTIVE_BACKEND_TYPE === 'basic';
