import { get, getList, post } from '@waldur/core/api';

export const getAllBookings = () =>
  get(`/booking-resources/`).then(response => response.data);

export const getBookingsList = (params?: {}) =>
  getList(`/booking-resources/`, params);

export const acceptBooking = (bookingUuid: string) =>
  post(`/booking-resources/${bookingUuid}/accept/`);

export const rejectBooking = (bookingUuid: string) =>
  post(`/booking-resources/${bookingUuid}/reject/`);
