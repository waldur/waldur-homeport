import * as constants from './constants';

const INITIAL_STATE = {
  step: 'Describe',
};

export const offeringReducer = (state = INITIAL_STATE, action) => {
  const { type, payload } = action;
  switch (type) {
    case constants.SET_STEP:
      return {
        ...state,
        step: payload.step,
      };
    default:
      return state;
  }
};
