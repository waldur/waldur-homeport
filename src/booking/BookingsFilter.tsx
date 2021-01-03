import React, { FunctionComponent } from 'react';
import { Row } from 'react-bootstrap';
import { reduxForm } from 'redux-form';

import {
  BookingStateFilter,
  getStates,
} from '@waldur/booking/BookingStateFilter';
import { BOOKINGS_FILTER_FORM_ID } from '@waldur/booking/store/constants';

const PureBookingsFilter: FunctionComponent = () => (
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

export const BookingsFilter = enhance(PureBookingsFilter);
