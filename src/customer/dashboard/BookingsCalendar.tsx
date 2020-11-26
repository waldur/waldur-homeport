import * as classNames from 'classnames';
import * as React from 'react';
import { useSelector } from 'react-redux';
import useAsync from 'react-use/lib/useAsync';
import { getFormValues } from 'redux-form';

import { getBookingsList } from '@waldur/booking/common/api';
import { Calendar } from '@waldur/booking/components/calendar/Calendar';
import { eventRender } from '@waldur/booking/components/utils';
import { BOOKING_RESOURCES_TABLE } from '@waldur/booking/constants';
import { eventsMapper } from '@waldur/booking/utils';
import { formatDateTime } from '@waldur/core/dateUtils';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { BOOKINGS_FILTER_FORM_ID } from '@waldur/customer/dashboard/contants';
import { translate } from '@waldur/i18n';
import { selectTablePagination } from '@waldur/workspace/selectors';

const bookingsFilterFormSelector = (state) =>
  (getFormValues(BOOKINGS_FILTER_FORM_ID)(state) || {}) as { state };

const bookingsFilterStateSelector = (state) =>
  bookingsFilterFormSelector(state).state;

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
) {
  const bookings = await getBookingsList({
    provider_uuid: providerUuid,
    offering_uuid: offeringUuid,
    offering_type: 'Marketplace.Booking',
    state: state?.map(({ value }) => value),
    page,
    page_size,
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
    (state) =>
      selectTablePagination(state, BOOKING_RESOURCES_TABLE)?.currentPage,
  );
  const bookingsListPageSize = useSelector(
    (state) => selectTablePagination(state, BOOKING_RESOURCES_TABLE)?.pageSize,
  );

  const { loading, value: calendarEvents, error } = useAsync(
    () =>
      loadBookingOfferings(
        providerUuid,
        offeringUuid,
        bookingsFilterState,
        bookingsListCurrentPage,
        bookingsListPageSize,
      ),
    [
      providerUuid,
      offeringUuid,
      bookingsFilterState,
      bookingsListCurrentPage,
      bookingsListPageSize,
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
