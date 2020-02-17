import * as constants from '../constants';
import { UpdateProps } from './types';

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

export const addBooking = payload => ({
  type: constants.ADD_BOOKING,
  payload: {
    id: payload.id,
    start: payload.start,
    end: payload.end,
    type: payload.type,
    title: payload.title,
    allDay: payload.allDay,
    extendedProps: payload.extendedProps,
  },
});

export const removeBooking = (bookingId: number | string) => ({
  type: constants.REMOVE_BOOKING,
  payload: {
    bookingId,
  },
});

export const updateBooking = (payload: UpdateProps) => ({
  type: constants.UPDATE_BOOKING,
  payload: {
    oldId: payload.event.id,
    event: {
      id: payload.event.id,
      start: payload.event.start,
      allDay: payload.event.allDay,
      end: payload.event.end,
      type: payload.event.type,
      title: payload.event.title,
      extendedProps: payload.event.extendedProps,
    },
  },
});

export const setSettings = payload => ({
  type: constants.UPDATE_CONFIG,
  payload: {
    config: payload,
  },
});
