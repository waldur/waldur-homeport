import classNames from 'classnames';
import { Col, Row } from 'react-bootstrap';
import { useAsync } from 'react-use';

import { getBookingsList } from '@waldur/booking/api';
import { BookingFilterStateOption } from '@waldur/booking/BookingStateFilter';
import { Calendar } from '@waldur/booking/components/calendar/Calendar';
import { eventRender } from '@waldur/booking/components/utils';
import { OFFERING_TYPE_BOOKING } from '@waldur/booking/constants';
import { eventsMapper } from '@waldur/booking/utils';
import { formatDateTime } from '@waldur/core/dateUtils';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { stringToColor } from '@waldur/core/stringToColor';
import { orderByFilter } from '@waldur/core/utils';
import { BookingsCalendarLegend } from '@waldur/customer/dashboard/BookingsCalendarLegend';
import { translate } from '@waldur/i18n';

export const getCalendarEvent = (bookingItem, event) => ({
  ...event,
  className: classNames({
    progress: bookingItem.state === 'Creating',
  }),
  color: stringToColor(bookingItem.offering_uuid),
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

async function loadBookingOfferings({
  customerUuid,
  projectUuid,
  offeringUuid,
  bookingsFilterState: state,
  bookingsListCurrentPage: page,
  bookingsListPageSize: page_size,
  bookingsListSorting: sorting,
}: BookingsCalendarProps) {
  const bookings = await getBookingsList({
    connected_customer_uuid: customerUuid,
    project_uuid: projectUuid,
    offering_uuid: offeringUuid,
    offering_type: OFFERING_TYPE_BOOKING,
    state: state?.map(({ value }) => value),
    page,
    page_size,
    o: orderByFilter(sorting),
  });
  return getCalendarEvents(bookings);
}

interface BookingsCalendarProps {
  customerUuid?: string;
  projectUuid?: string;
  offeringUuid?: string;
  bookingsFilterState: BookingFilterStateOption[];
  bookingsListCurrentPage: number;
  bookingsListPageSize: number;
  bookingsListSorting;
}

export const BookingsCalendar = (props: BookingsCalendarProps) => {
  const {
    loading,
    value: calendarEvents,
    error,
  } = useAsync(() => loadBookingOfferings(props), [props]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <h3>{translate('Unable to load booking offerings.')}</h3>;
  }

  return calendarEvents.length ? (
    <>
      <Row>
        <BookingsCalendarLegend events={calendarEvents} />
      </Row>
      <Row style={{ marginBottom: '30px' }}>
        <Col md={{ span: 8, offset: 2 }}>
          <Calendar
            height="auto"
            eventLimit={false}
            events={calendarEvents}
            eventRender={(info) => eventRender({ ...info, withTooltip: true })}
          />
        </Col>
      </Row>
    </>
  ) : null;
};
