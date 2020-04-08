import * as constants from '../constants';
import { BookingProps } from '../types';

export const fetchBookingItems = payload => ({
  type: constants.BOOKINGS_FETCH,
  payload: {
    offering_type: constants.OFFERING_TYPE_BOOKING,
    offering_uuid: payload.offering_uuid,
  },
});

export const setBookingItems = (offeringId, items) => ({
  type: constants.BOOKINGS_SET,
  payload: {
    offeringId,
    items,
  },
});

export const acceptBookingItem = payload => ({
  type: constants.BOOKING_ACCEPT,
  payload: {
    offering_type: constants.OFFERING_TYPE_BOOKING,
    offering_uuid: payload.offering_uuid,
    uuid: payload.uuid,
  },
});

export const rejectBookingItem = payload => ({
  type: constants.BOOKING_REJECT,
  payload: {
    offering_type: constants.OFFERING_TYPE_BOOKING,
    offering_uuid: payload.offering_uuid,
    uuid: payload.uuid,
  },
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

export const setSettings = payload => ({
  type: constants.SET_CONFIG,
  payload: {
    config: payload,
  },
});

export const setBookings = bookings => ({
  type: constants.SET_BOOKINGS,
  payload: {
    bookings,
  },
});
