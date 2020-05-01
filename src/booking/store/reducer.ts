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
      return {
        ...state,
        [payload.offeringId]: payload.items,
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
      return {
        ...state,
        schedules: [
          ...state.schedules.filter(item => item.id !== payload.oldID),
          payload.event,
        ],
      };

    case constants.REMOVE_BOOKING:
      return {
        ...state,
        schedules: state.schedules.filter(
          item => item.id !== payload.bookingID,
        ),
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
      return {
        ...state,
        bookings: payload.bookings,
      };

    default:
      return state;
  }
};
