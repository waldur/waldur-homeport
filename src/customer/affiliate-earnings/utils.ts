import { ENV } from '@/core/config';
import { isFeatureVisible } from '@/features/connect';
import { ResellerFeatures } from '@/FeaturesEnums';

/**
 * Whether the affiliate program is on: shown in the UI (the
 * `reseller.affiliates` feature) and run by the backend (the
 * `AFFILIATES_ENABLED` setting). Pages and texts about affiliate fees appear
 * only then.
 */
export const isAffiliateProgramOn = () =>
  isFeatureVisible(ResellerFeatures.affiliates) &&
  Boolean(ENV.plugins.WALDUR_CORE?.AFFILIATES_ENABLED);
