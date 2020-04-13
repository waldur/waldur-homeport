import * as constants from '../constants';
import { State } from '../types';

const INITIAL_STATE: State = {
  bookings: [],
  schedules: [],
  config: {
    weekends: true,
    minTime: '00:00',
    maxTime: '24:00',
    businessHours: {
      startTime: '00:00',
      endTime: '24:00',
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
        schedules: [...state.schedules, payload],
      };

    case constants.UPDATE_BOOKING:
      const { event, oldID } = payload;
      const updatedList = state.schedules.filter(item => item.id !== oldID);
      return {
        ...state,
        schedules: [...updatedList, event],
      };

    case constants.REMOVE_BOOKING:
      const removedList = state.schedules.filter(
        item => item.id !== payload.bookingID,
      );
      return {
        ...state,
        schedules: [...removedList],
      };

    case constants.SET_CONFIG:
      return {
        ...state,
        config: {
          ...state.config,
          ...payload.config,
        },
      };
    case constants.SET_BOOKINGS:
      const { bookings } = payload;
      return {
        ...state,
        bookings,
      };

    default:
      return state;
  }
};
