import { ENV } from '@/core/config';
import { FeaturesEnum } from '@/FeaturesEnums';

export const isFeatureVisible = (feature: FeaturesEnum) => {
  if (feature === undefined || feature === null) {
    return true;
  }
  if (!ENV.FEATURES) {
    return false;
  }
  const [section, key] = feature.split('.');
  // Coerce to a real boolean: a missing key yields `undefined`, and React
  // Query's `enabled` only treats an explicit `false` as disabled — an
  // `undefined` would let feature-gated queries fire against absent endpoints.
  return Boolean((ENV.FEATURES[section] || {})[key]);
};
