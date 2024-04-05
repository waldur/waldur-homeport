import { FeaturesEnum } from '@waldur/FeaturesEnums';
import { isVisible } from '@waldur/store/config';
import store from '@waldur/store/store';

export const isFeatureVisible = (feature: FeaturesEnum) =>
  isVisible(store.getState(), feature);
