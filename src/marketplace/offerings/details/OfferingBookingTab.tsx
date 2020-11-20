import * as React from 'react';
import * as Col from 'react-bootstrap/lib/Col';
import * as Row from 'react-bootstrap/lib/Row';

import { BookingsFilter } from '@waldur/booking/BookingsFilter';
import { BookingsList } from '@waldur/booking/BookingsList';
import { BookingsCalendar } from '@waldur/customer/dashboard/BookingsCalendar';

interface OfferingBookingTab {
  offeringUuid: string;
}

export const OfferingBookingTab = ({ offeringUuid }: OfferingBookingTab) => (
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
