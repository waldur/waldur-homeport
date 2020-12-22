import { isVisible } from '@waldur/store/config';
import store from '@waldur/store/store';

export const isFeatureVisible = (feature: string) =>
  isVisible(store.getState(), feature);
