const INITIAL_STATE = null;

export const INIT_CONFIG = 'waldur/core/INIT_CONFIG';

export const initConfig = config => ({
  type: INIT_CONFIG,
  payload: {
    config,
  },
});

const getFeaturesMap = features => {
  const map = {};
  features.forEach(feature => {
    map[feature] = true;
  });
  return map;
};

export const reducer = (state = INITIAL_STATE, action) => {
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

export const getConfig = state => state.config;

export const isVisible = (state, feature) => {
  const {
    featuresVisible,
    disabledFeatures = {},
    enabledFeatures = {},
  } = state.config;
  if (feature === undefined || feature === null) {
    return true;
  }
  if (enabledFeatures[feature]) {
    return true;
  }
  if (disabledFeatures[feature]) {
    return false;
  }
  return featuresVisible;
};

export const getNativeNameVisible = state =>
  state.config.plugins.WALDUR_CORE.NATIVE_NAME_ENABLED === true;
