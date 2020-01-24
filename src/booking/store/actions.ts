import * as constants from '../constants';

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
