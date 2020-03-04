import * as React from 'react';
import * as Row from 'react-bootstrap/lib/Row';
import { reduxForm } from 'redux-form';

import {
  BookingStateFilter,
  getStates,
} from '@waldur/booking/BookingStateFilter';

const PureBookingsFilter = () => (
  <Row>
    <BookingStateFilter />
  </Row>
);

const enhance = reduxForm({
  form: 'BookingsFilter',
  initialValues: {
    state: [getStates()[0], getStates()[1]],
  },
});

export const BookingsFilter = enhance(
  PureBookingsFilter,
) as React.ComponentType<{}>;
