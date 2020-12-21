import React, { FunctionComponent } from 'react';
import { Row } from 'react-bootstrap';
import { reduxForm } from 'redux-form';

import { OfferingStateFilter, getStates } from './OfferingStateFilter';

const PureOfferingsFilter: FunctionComponent = () => (
  <Row>
    <OfferingStateFilter />
  </Row>
);

const enhance = reduxForm({
  form: 'OfferingsFilter',
  initialValues: {
    state: [getStates()[0], getStates()[1]],
  },
});

export const OfferingsFilter = enhance(PureOfferingsFilter);
