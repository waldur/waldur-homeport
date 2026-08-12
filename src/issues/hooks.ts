import { ENV } from '@/core/config';

export const hasSupport = () => !!ENV.plugins.WALDUR_SUPPORT?.ENABLED;

export const hasProviderRouting = () =>
  !!ENV.plugins.WALDUR_SUPPORT?.PROVIDER_ROUTING_ENABLED;
