const INITIAL_STATE = null;

const INIT_CONFIG = 'waldur/core/INIT_CONFIG';

export const initConfig = (config) => ({
  type: INIT_CONFIG,
  payload: {
    config
  }
});

const getFeaturesMap = features => {
  let map = {};
  features.forEach(feature => {
    map[feature] = true;
  });
  return map;
};

export const reducer = (state=INITIAL_STATE, action) => {
  switch(action.type) {

  case INIT_CONFIG: {
    const {toBeFeatures, disabledFeatures = [], enabledFeatures = []} = action.payload.config;
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
  const {featuresVisible, disabledFeatures = {}, enabledFeatures = {}} = state.config;
  return enabledFeatures[feature] || featuresVisible || !disabledFeatures[feature];
};

export const getNativeNameVisible = state =>
  state.config.plugins.WALDUR_CORE.NATIVE_NAME_ENABLED === true;
