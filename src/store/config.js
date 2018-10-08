const INITIAL_STATE = null;

const INIT_CONFIG = 'waldur/core/INIT_CONFIG';

export const initConfig = (config) => ({
  type: INIT_CONFIG,
  payload: {
    config
  }
});

const getFeaturesMap = config => {
  let map = {};
  const features = config.toBeFeatures.concat(config.disabledFeatures);
  features.forEach(feature => {
    map[feature] = true;
  });
  return map;
};

export const reducer = (state=INITIAL_STATE, action) => {
  switch(action.type) {

  case INIT_CONFIG:
    return {
      ...action.payload.config,
      features: getFeaturesMap(action.payload.config)
    };

  default:
    return state;
  }
};

export const getConfig = state => state.config;

export const isVisible = (state, feature) => (
  state.config.featuresVisible || !state.config.features[feature]
);

export const getNativeNameVisible = state =>
  state.config.plugins.WALDUR_CORE.NATIVE_NAME_ENABLED === true;
