import {EventInput} from '@fullcalendar/core/structs/event';

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

export const addBooking = (payload: {event: EventInput, meta?: {form: string, field: string}}) => ({
  type: constants.ADD_BOOKING,
  meta: {
    form: payload.meta.form,
    field: payload.meta.field,
  },
  payload: {
    id: payload.event.id,
    start: payload.event.start,
    end: payload.event.end,
    type: payload.event.type,
    title: payload.event.title,
  },
});

export const removeBooking = (bookingId: EventInput['id']) => ({
  type: constants.REMOVE_BOOKING,
  payload: {
    bookingId,
  },
});

export const updateBooking = (payload: UpdateProps) => ({
  type: constants.UPDATE_BOOKING,
  payload: {
    meta: {
      form: payload.meta.form,
      field: payload.meta.field,
    },
    oldId: payload.oldEvent.id,
    event: {
      id: payload.event.id,
      start: payload.event.start,
      end: payload.event.end,
      type: payload.event.type,
      title: payload.event.title,
    },
  },
});
