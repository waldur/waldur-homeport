import classNames from 'classnames';
import { useSelector } from 'react-redux';
import { useAsync } from 'react-use';

import { getBookingsList } from '@waldur/booking/api';
import { Calendar } from '@waldur/booking/components/calendar/Calendar';
import { eventRender } from '@waldur/booking/components/utils';
import { BOOKING_RESOURCES_TABLE } from '@waldur/booking/constants';
import { bookingFormSelector } from '@waldur/booking/store/selectors';
import { eventsMapper } from '@waldur/booking/utils';
import { formatDateTime } from '@waldur/core/dateUtils';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { orderByFilter } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { RootState } from '@waldur/store/reducers';
import {
  selectTablePagination,
  selectTableSorting,
} from '@waldur/table/selectors';

const bookingsFilterStateSelector = (state: RootState) =>
  bookingFormSelector(state)?.state;

export const getCalendarEvent = (bookingItem, event) => ({
  ...event,
  className: classNames({
    progress: bookingItem.state === 'Creating',
    'event-terminated': bookingItem.state === 'Terminated',
  }),
  color: classNames({
    '#f8ac59': bookingItem.state === 'Terminated',
  }),
  name: bookingItem.name,
  offering_name: bookingItem.offering_name,
  project_name: bookingItem.project_name,
  customer_name: bookingItem.customer_name,
  created_by_full_name: bookingItem.created_by_full_name,
  approved_by_full_name: bookingItem.approved_by_full_name,
  created: formatDateTime(bookingItem.created),
  state: bookingItem.state,
});

const getCalendarEvents = (bookings) => {
  const bookedEvents = [];
  bookings.forEach((item) => {
    const schedules = [];
    item.attributes?.schedules.forEach((event) => {
      schedules.push(getCalendarEvent(item, event));
    });
    bookedEvents.push(...schedules);
  });
  return eventsMapper(bookedEvents);
};

async function loadBookingOfferings(
  providerUuid: string,
  offeringUuid: string,
  state,
  page,
  page_size,
  sorting,
) {
  const bookings = await getBookingsList({
    provider_uuid: providerUuid,
    offering_uuid: offeringUuid,
    offering_type: 'Marketplace.Booking',
    state: state?.map(({ value }) => value),
    page,
    page_size,
    o: orderByFilter(sorting),
  });
  return getCalendarEvents(bookings);
}

interface BookingsCalendarProps {
  providerUuid?: string;
  offeringUuid?: string;
}

export const BookingsCalendar = ({
  providerUuid,
  offeringUuid,
}: BookingsCalendarProps) => {
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

  const { loading, value: calendarEvents, error } = useAsync(
    () =>
      loadBookingOfferings(
        providerUuid,
        offeringUuid,
        bookingsFilterState,
        bookingsListCurrentPage,
        bookingsListPageSize,
        bookingsListSorting,
      ),
    [
      providerUuid,
      offeringUuid,
      bookingsFilterState,
      bookingsListCurrentPage,
      bookingsListPageSize,
      bookingsListSorting,
    ],
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <h3>{translate('Unable to load booking offerings.')}</h3>;
  }

  return calendarEvents.length ? (
    <Calendar
      height="auto"
      eventLimit={false}
      events={calendarEvents}
      eventRender={(info) => eventRender({ ...info, withTooltip: true })}
    />
  ) : (
    <p>{translate('There are no events.')}</p>
  );
};
