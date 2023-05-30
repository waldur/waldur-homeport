import * as constants from '../constants';

export const setBookingConfig = (payload) => ({
  type: constants.SET_BOOKING_CONFIG,
  payload: {
    config: payload,
  },
});
