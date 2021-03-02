import * as constants from '../constants';
import { BookingProps } from '../types';

export const acceptBookingItem = (payload) => ({
  type: constants.BOOKING_ACCEPT,
  payload,
});

export const rejectBookingItem = (payload) => ({
  type: constants.BOOKING_REJECT,
  payload,
});

export const addBooking = (payload: BookingProps) => ({
  type: constants.ADD_BOOKING,
  payload: {
    start: payload.start,
    end: payload.end,
    allDay: payload.allDay,
    id: payload.id,
    title: payload.title,
    extendedProps: payload.extendedProps,
  },
});

export const removeBooking = (bookingID: number | string) => ({
  type: constants.REMOVE_BOOKING,
  payload: {
    bookingID,
  },
});

export const updateBooking = (payload: {
  oldID: BookingProps['id'];
  event: BookingProps;
}) => ({
  type: constants.UPDATE_BOOKING,
  payload: {
    oldID: payload.oldID,
    event: {
      id: payload.event.id,
      start: payload.event.start,
      end: payload.event.end,
      allDay: payload.event.allDay,
      title: payload.event.title,
      extendedProps: payload.event.extendedProps,
    },
  },
});

export const setBookingConfig = (payload) => ({
  type: constants.SET_BOOKING_CONFIG,
  payload: {
    config: payload,
  },
});
