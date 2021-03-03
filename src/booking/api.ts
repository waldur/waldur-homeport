import { BookedItem } from '@waldur/booking/types';
import { get, getAll, getById, getList, post } from '@waldur/core/api';
import { Offering } from '@waldur/marketplace/types';

export const getAllBookings = () =>
  get(`/booking-resources/`).then((response) => response.data);

export const getBookingsList = (params?: {}) =>
  getList(`/booking-resources/`, params);

export const acceptBooking = (bookingUuid: string) =>
  post(`/booking-resources/${bookingUuid}/accept/`);

export const rejectBooking = (bookingUuid: string) =>
  post(`/booking-resources/${bookingUuid}/reject/`);

export const getOfferingBookedItems = (offeringUuid: string) =>
  getAll<BookedItem[]>(`/marketplace-bookings/${offeringUuid}/`).then(
    (res) => res,
  );

export const getBookingOffering = (uuid: string) =>
  getById<Offering>('/booking-offerings/', uuid);
