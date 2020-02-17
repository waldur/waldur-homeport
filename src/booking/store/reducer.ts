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
      return {
        ...state,
        events: [
          ...state.events,
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
