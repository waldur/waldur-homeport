const INITIAL_STATE = null;

const INIT_CONFIG = 'waldur/core/INIT_CONFIG';

export const initConfig = (config) => ({
  type: INIT_CONFIG,
  payload: {
    config
  }
});

export const reducer = (state=INITIAL_STATE, action) => {
  switch(action.type) {

  case INIT_CONFIG:
    return action.payload.config;

  default:
    return state;
  }
};

export const getConfig = state => state.config;
