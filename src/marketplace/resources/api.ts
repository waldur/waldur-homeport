import { post } from '@waldur/core/api';

export const acceptBooking = (bookingUuid: string) =>
  post(`/booking-resources/${bookingUuid}/accept/`);

export const rejectBooking = (bookingUuid: string) =>
  post(`/booking-resources/${bookingUuid}/reject/`);
