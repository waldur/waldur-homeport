import { FunctionComponent } from 'react';
import { Col, Row } from 'react-bootstrap';

import { BookingsFilter } from '@waldur/booking/BookingsFilter';
import { BookingsList } from '@waldur/booking/BookingsList';
import { BookingsCalendar } from '@waldur/customer/dashboard/BookingsCalendar';
import { useBookingsCalendarProps } from '@waldur/customer/dashboard/utils';

interface OfferingBookingTab {
  offeringUuid: string;
}

export const OfferingBookingTab: FunctionComponent<OfferingBookingTab> = ({
  offeringUuid,
}) => {
  const bookingsCalendarProps = useBookingsCalendarProps();
  return (
    <Row>
      <Col md={6}>
        <BookingsCalendar
          offeringUuid={offeringUuid}
          {...bookingsCalendarProps}
        />
      </Col>
      <Col md={6}>
        <BookingsFilter />
        <BookingsList offeringUuid={offeringUuid} />
      </Col>
    </Row>
  );
};
