import { ApplicationConfigurationOptions } from '@waldur/core/types';
import { FeaturesEnum } from '@waldur/FeaturesEnums';

import { RootState } from './reducers';

const INITIAL_STATE: ApplicationConfigurationOptions = null;

const INIT_CONFIG = 'waldur/core/INIT_CONFIG';

export const initConfig = (config: any) => ({
  type: INIT_CONFIG,
  payload: {
    config,
  },
});

export const reducer = (
  state = INITIAL_STATE,
  action,
): ApplicationConfigurationOptions => {
  switch (action.type) {
    case INIT_CONFIG: {
      const { FEATURES = {} } = action.payload.config;
      const result = {};
      for (const skey of Object.keys(FEATURES)) {
        for (const fkey of Object.keys(FEATURES[skey])) {
          result[`${skey}.${fkey}`] = FEATURES[skey][fkey];
        }
      }
      return {
        ...action.payload.config,
        FEATURES: result,
      };
    }

    default:
      return state;
  }
};

export const getConfig = (state: RootState) => state.config;

const isVisibleSelector = (feature: FeaturesEnum) => (state: RootState) => {
  if (feature === undefined || feature === null) {
    return true;
  }
  if (!state.config.FEATURES) {
    return false;
  }
  return state.config.FEATURES[feature];
};

export const isVisible = (state: RootState, feature: FeaturesEnum): boolean => {
  return isVisibleSelector(feature)(state);
};

export const getNativeNameVisible = (state: RootState) =>
  state.config.plugins.WALDUR_CORE.NATIVE_NAME_ENABLED === true;
