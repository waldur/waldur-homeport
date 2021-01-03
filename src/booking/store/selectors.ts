import { getFormValues } from 'redux-form';

import { ConfigProps } from '@waldur/booking/types';

import { BOOKINGS_FILTER_FORM_ID } from './constants';

interface BookingFilterFormData {
  state: { value: string; label: string }[];
}

export const getConfig = (state) => state.bookings.config as ConfigProps;

export const bookingFormSelector = (state) =>
  getFormValues(BOOKINGS_FILTER_FORM_ID)(state) as BookingFilterFormData;
