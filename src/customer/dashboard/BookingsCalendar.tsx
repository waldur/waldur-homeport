import * as classNames from 'classnames';
import * as React from 'react';
import * as Col from 'react-bootstrap/lib/Col';
import * as Row from 'react-bootstrap/lib/Row';
import { useSelector } from 'react-redux';
import useAsync from 'react-use/lib/useAsync';
import { getFormValues } from 'redux-form';

import { getBookingsList } from '@waldur/booking/common/api';
import { Calendar } from '@waldur/booking/components/calendar/Calendar';
import { eventRender } from '@waldur/booking/components/utils';
import { TABLE_NAME } from '@waldur/booking/constants';
import { eventsMapper } from '@waldur/booking/utils';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { BOOKINGS_FILTER_FORM_ID } from '@waldur/customer/dashboard/contants';
import { translate } from '@waldur/i18n';
import { selectTablePagination } from '@waldur/workspace/selectors';

const bookingsFilterFormSelector = (state) =>
  (getFormValues(BOOKINGS_FILTER_FORM_ID)(state) || {}) as { state };

const bookingsFilterStateSelector = (state) =>
  bookingsFilterFormSelector(state).state;

const getCalendarEvents = (bookings) => {
  const bookedEvents = [];
  bookings.forEach((item) => {
    const schedules = [];
    item.attributes?.schedules.forEach((event) => {
      schedules.push({
        ...event,
        state: item.state,
        className: classNames({
          progress: item.state === 'Creating',
          'event-terminated': item.state === 'Terminated',
        }),
        color: classNames({
          '#f8ac59': item.state === 'Terminated',
        }),
      });
    });
    bookedEvents.push(...schedules);
  });
  return eventsMapper(bookedEvents);
};

async function loadBookingOfferings(providerUuid: string, state, pagination) {
  const bookings = await getBookingsList({
    provider_uuid: providerUuid,
    offering_type: 'Marketplace.Booking',
    state: state?.map(({ value }) => value),
    page: pagination.currentPage,
    page_size: pagination.pageSize,
  });
  return getCalendarEvents(bookings);
}

interface BookingsCalendarProps {
  providerUuid: string;
}

export const BookingsCalendar = ({ providerUuid }: BookingsCalendarProps) => {
  const bookingsFilterState = useSelector(bookingsFilterStateSelector);
  const bookingsListPagination = useSelector((state) =>
    selectTablePagination(state, TABLE_NAME),
  );

  const { loading, value: calendarEvents, error } = useAsync(
    () =>
      loadBookingOfferings(
        providerUuid,
        bookingsFilterState,
        bookingsListPagination,
      ),
    [providerUuid, bookingsFilterState],
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <h3>{translate('Unable to load booking offerings.')}</h3>;
  }

  return calendarEvents.length ? (
    <Row style={{ marginBottom: '30px' }}>
      <Col md={8} mdOffset={2}>
        <Calendar
          height="auto"
          eventLimit={false}
          events={calendarEvents}
          eventRender={(info) => eventRender({ ...info, withTooltip: true })}
        />
      </Col>
    </Row>
  ) : (
    <p>{translate('There are no events.')}</p>
  );
};
