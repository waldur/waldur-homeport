import * as constants from '../constants';
import { BookingState } from '../types';

const INITIAL_STATE: BookingState = {
  bookings: [],
  schedules: [],
  config: {
    weekends: true,
    minTime: '00:00',
    maxTime: '24:00',
    slotDuration: '01:00:00',
    businessHours: {
      startTime: '00:00',
      endTime: '24:00',
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    },
  },
};

export const reducer = (
  state: BookingState = INITIAL_STATE,
  action,
): BookingState => {
  const { type, payload } = action;
  switch (type) {
    case constants.ADD_BOOKING:
      return {
        ...state,
        schedules: [...state.schedules, payload],
      };

    case constants.UPDATE_BOOKING:
      return {
        ...state,
        schedules: [
          ...state.schedules.filter((item) => item.id !== payload.oldID),
          payload.event,
        ],
      };

    case constants.REMOVE_BOOKING:
      return {
        ...state,
        schedules: state.schedules.filter(
          (item) => item.id !== payload.bookingID,
        ),
      };

    case constants.SET_BOOKING_CONFIG:
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
