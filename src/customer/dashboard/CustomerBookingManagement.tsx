import * as React from 'react';
import * as Col from 'react-bootstrap/lib/Col';
import * as Row from 'react-bootstrap/lib/Row';
import { useSelector } from 'react-redux';

import { BookingsFilter } from '@waldur/booking/BookingsFilter';
import { BookingsList } from '@waldur/booking/BookingsList';
import { Panel } from '@waldur/core/Panel';
import { BookingsCalendar } from '@waldur/customer/dashboard/BookingsCalendar';
import { translate } from '@waldur/i18n';
import { getCustomer } from '@waldur/workspace/selectors';

export const CustomerBookingManagement = () => {
  const customer = useSelector(getCustomer);
  return customer.is_service_provider ? (
    <Panel title={translate('Booking management')}>
      <Row style={{ marginBottom: '30px' }}>
        <Col md={8} mdOffset={2}>
          <BookingsCalendar providerUuid={customer.uuid} />
        </Col>
      </Row>
      <BookingsFilter />
      <BookingsList providerUuid={customer.uuid} />
    </Panel>
  ) : null;
};
