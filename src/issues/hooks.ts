import { ENV } from '@/core/config';

export const hasSupport = () => !!ENV.plugins.WALDUR_SUPPORT?.ENABLED;
