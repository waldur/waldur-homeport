import * as constants from '../constants';

export const reducer = (state = {}, action) => {
  const { type, payload } = action;
  switch (type) {
    case constants.BOOKINGS_SET:
      const { offeringId, items } = payload;
      return {
        ...state,
        [offeringId]: items,
      };

    case constants.BOOKING_ACCEPT:
      return {
        ...state,
      };

    case constants.BOOKING_REJECT:
      return {
        ...state,
      };

    default:
      return state;
  }
};
