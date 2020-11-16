import * as React from 'react';
import * as Row from 'react-bootstrap/lib/Row';
import { reduxForm } from 'redux-form';

import {
  BookingStateFilter,
  getStates,
} from '@waldur/booking/BookingStateFilter';
import { BOOKINGS_FILTER_FORM_ID } from '@waldur/customer/dashboard/contants';

const PureBookingsFilter = () => (
  <Row style={{ margin: '0' }}>
    <BookingStateFilter />
  </Row>
);

const enhance = reduxForm({
  form: BOOKINGS_FILTER_FORM_ID,
  initialValues: {
    state: [getStates()[0], getStates()[1]],
  },
});

export const BookingsFilter = enhance(
  PureBookingsFilter,
) as React.ComponentType<{}>;
