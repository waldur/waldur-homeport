import * as constants from '../constants';
import { State } from './types';

const INITIAL_STATE: State = {
  bookings: [],
  schedules: [],
  config: {
    weekend: true,
    minTIme: '00:00',
    maxTime: '24:00',
  },
  loading: false,
  events: [],
  errors: [],
};

export const reducer = (state = INITIAL_STATE, action) => {
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

    case constants.ADD_BOOKING:
      const { field } = action.meta;
      return {
        ...state,
        [field]: [
          ...state[field],
          payload,
        ],
      };

    case constants.UPDATE_BOOKING:
      const { event, oldId } = payload;
      const updatedList = state.events.filter(item => item.id !== oldId);
      return {
        ...state,
        events: [
          ...updatedList,
          event,
        ],
      };

    case constants.REMOVE_BOOKING:
      const { bookingId } = payload;
      const removedList = state.events.filter(item => item.id !== bookingId);
      return {
        ...state,
        events: [
          ...removedList,
        ],
      };

    default:
      return state;
  }
};
