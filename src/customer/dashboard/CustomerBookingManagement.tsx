import * as classNames from 'classnames';
import * as React from 'react';
import * as Col from 'react-bootstrap/lib/Col';
import * as Row from 'react-bootstrap/lib/Row';
import { useSelector } from 'react-redux';
import useAsync from 'react-use/lib/useAsync';

import { BookingsFilter } from '@waldur/booking/BookingsFilter';
import { BookingsList } from '@waldur/booking/BookingsList';
import { Calendar } from '@waldur/booking/components/calendar/Calendar';
import { eventRender } from '@waldur/booking/components/utils';
import { eventsMapper } from '@waldur/booking/utils';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { Panel } from '@waldur/core/Panel';
import { translate } from '@waldur/i18n';
import { getAllOfferings } from '@waldur/marketplace/common/api';
import { Offering } from '@waldur/marketplace/types';
import { getCustomer } from '@waldur/workspace/selectors';

const getCalendarEvents = (offerings: Offering[]) => {
  const bookedEvents = [];
  offerings.map((item) => {
    const schedules = [];
    item.attributes.schedules.forEach((event) => {
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

async function loadBookingOfferings(customerUuid: string) {
  const offerings: Offering[] = await getAllOfferings({
    params: {
      provider_uuid: customerUuid,
      type: 'Marketplace.Booking',
    },
  });
  const calendarEvents = getCalendarEvents(offerings);
  return { offerings, calendarEvents };
}

export const CustomerBookingManagement = () => {
  const customer = useSelector(getCustomer);

  const { loading, value, error } = useAsync(
    () => loadBookingOfferings(customer.uuid),
    [customer],
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <h3>{translate('Unable to load booking offerings.')}</h3>;
  }

  return value.offerings.length ? (
    <Panel title={translate('Booking management')}>
      {value.calendarEvents.length ? (
        <Row style={{ marginBottom: '30px' }}>
          <Col md={8} mdOffset={2}>
            <Calendar
              height="auto"
              eventLimit={false}
              events={value.calendarEvents}
              eventRender={(info) =>
                eventRender({ ...info, withTooltip: true })
              }
            />
          </Col>
        </Row>
      ) : (
        <p>{translate('There are no events.')}</p>
      )}
      <BookingsFilter />
      <BookingsList providerUuid={customer.uuid} />
    </Panel>
  ) : null;
};
