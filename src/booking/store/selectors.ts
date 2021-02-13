import { getFormValues } from 'redux-form';

import { BookingFilterStateOption } from '@waldur/booking/BookingStateFilter';
import { RootState } from '@waldur/store/reducers';

import { BOOKINGS_FILTER_FORM_ID } from './constants';

interface BookingFilterFormData {
  state: BookingFilterStateOption[];
}

export const getConfig = (state: RootState) => state.bookings.config;

export const bookingFormSelector = (state: RootState) =>
  getFormValues(BOOKINGS_FILTER_FORM_ID)(state) as BookingFilterFormData;
