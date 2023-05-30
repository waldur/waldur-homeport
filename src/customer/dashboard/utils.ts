import { useSelector } from 'react-redux';

import { BookingFilterStateOption } from '@waldur/booking/BookingStateFilter';
import { BOOKING_RESOURCES_TABLE } from '@waldur/booking/constants';
import { bookingFormSelector } from '@waldur/booking/store/selectors';
import { RootState } from '@waldur/store/reducers';
import {
  selectTablePagination,
  selectTableSorting,
} from '@waldur/table/selectors';

import { Legend } from './types';

export const bookingsFilterStateSelector = (
  state: RootState,
): BookingFilterStateOption[] => bookingFormSelector(state)?.state;

export const useBookingsCalendarProps = () => {
  const bookingsFilterState = useSelector(bookingsFilterStateSelector);
  const bookingsListCurrentPage = useSelector(
    (state: RootState) =>
      selectTablePagination(state, BOOKING_RESOURCES_TABLE)?.currentPage,
  );
  const bookingsListPageSize = useSelector(
    (state: RootState) =>
      selectTablePagination(state, BOOKING_RESOURCES_TABLE)?.pageSize,
  );
  const bookingsListSorting = useSelector((state: RootState) =>
    selectTableSorting(state, BOOKING_RESOURCES_TABLE),
  );
  return {
    bookingsFilterState,
    bookingsListCurrentPage,
    bookingsListPageSize,
    bookingsListSorting,
  };
};

// Refer to https://stackoverflow.com/a/15125941
export const getDistinctColorsFromEvents = (events): Legend[] => {
  const flags = [],
    output = [];
  for (const event of events) {
    if (flags[event.color]) continue;
    flags[event.color] = true;
    output.push({
      color: event.color,
      name: event.offering_name,
    });
  }
  return output;
};
