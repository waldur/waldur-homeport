import { FunctionComponent } from 'react';
import { Col, Row } from 'react-bootstrap';

import { BookingsFilter } from '@waldur/booking/BookingsFilter';
import { BookingsList } from '@waldur/booking/BookingsList';
import { BookingsCalendar } from '@waldur/customer/dashboard/BookingsCalendar';

interface OfferingBookingTab {
  offeringUuid: string;
}

export const OfferingBookingTab: FunctionComponent<OfferingBookingTab> = ({
  offeringUuid,
}) => (
  <Row>
    <Col md={6}>
      <BookingsCalendar offeringUuid={offeringUuid} />
    </Col>
    <Col md={6}>
      <BookingsFilter />
      <BookingsList offeringUuid={offeringUuid} />
    </Col>
  </Row>
);
