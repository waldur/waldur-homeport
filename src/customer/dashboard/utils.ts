import { useSelector } from 'react-redux';

import { BOOKING_RESOURCES_TABLE } from '@waldur/booking/constants';
import { bookingFormSelector } from '@waldur/booking/store/selectors';
import { BookingFilterStateOption } from '@waldur/booking/utils';
import { RootState } from '@waldur/store/reducers';
import {
  selectTablePagination,
  selectTableSorting,
} from '@waldur/table/selectors';

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
