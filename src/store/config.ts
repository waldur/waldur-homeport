import { ApplicationConfigurationOptions } from '@waldur/core/types';

import { RootState } from './reducers';

const INITIAL_STATE: ApplicationConfigurationOptions = null;

export const INIT_CONFIG = 'waldur/core/INIT_CONFIG';

export const initConfig = (config: any) => ({
  type: INIT_CONFIG,
  payload: {
    config,
  },
});

const getFeaturesMap = (features: string[]) => {
  const map = {};
  features.forEach((feature) => {
    map[feature] = true;
  });
  return map;
};

export const reducer = (
  state = INITIAL_STATE,
  action,
): ApplicationConfigurationOptions => {
  switch (action.type) {
    case INIT_CONFIG: {
      const {
        toBeFeatures = [],
        disabledFeatures = [],
        enabledFeatures = [],
      } = action.payload.config;
      return {
        ...action.payload.config,
        disabledFeatures: getFeaturesMap(toBeFeatures.concat(disabledFeatures)),
        enabledFeatures: getFeaturesMap(enabledFeatures),
      };
    }

    default:
      return state;
  }
};

export const getConfig = (state: RootState) => state.config;

export const isVisible = (state: RootState, feature: string): boolean => {
  const {
    featuresVisible,
    disabledFeatures = {},
    enabledFeatures = {},
  } = state.config;
  if (feature === undefined || feature === null) {
    return true;
  }
  if (disabledFeatures[feature]) {
    return false;
  }
  if (enabledFeatures[feature]) {
    return true;
  }
  return featuresVisible;
};

export const getNativeNameVisible = (state: RootState) =>
  state.config.plugins.WALDUR_CORE.NATIVE_NAME_ENABLED === true;
