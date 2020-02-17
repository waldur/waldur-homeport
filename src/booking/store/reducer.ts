import * as constants from '../constants';
import { State } from './types';

const INITIAL_STATE: State = {
  bookings: [],
  schedules: [],
  config: {
    weekends: true,
    minTime: '00:00',
    maxTime: '24:00',
    businessHours: {
      startTime: '00:00',
      endTime: '23:59',
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    },
  },
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
      return {
        ...state,
        bookings: [
          ...state.bookings,
          payload,
        ],
      };

    case constants.UPDATE_BOOKING:
      const { event, oldId } = payload;
      const updatedList = state.bookings.filter(item => item.id !== oldId);
      return {
        ...state,
        bookings: [
          ...updatedList,
          event,
        ],
      };

    case constants.REMOVE_BOOKING:
      const { bookingId } = payload;
      const removedList = state.bookings.filter(item => item.id !== bookingId);
      return {
        ...state,
        bookings: [
          ...removedList,
        ],
      };

    case constants.UPDATE_CONFIG:
      return {
        ...state,
        config: {
          ...state.config,
          ...payload.config,
        },
      };

    default:
      return state;
  }
};
