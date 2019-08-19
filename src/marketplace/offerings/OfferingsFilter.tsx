import * as React from 'react';
import * as Row from 'react-bootstrap/lib/Row';
import { reduxForm } from 'redux-form';

import { OfferingStateFilter, getStates } from './OfferingStateFilter';

const PureOfferingsFilter = () => (
  <Row>
    <OfferingStateFilter/>
  </Row>
);

const enhance = reduxForm({
  form: 'OfferingsFilter',
  initialValues: {
    state: [getStates()[0], getStates()[1]],
  },
});

export const OfferingsFilter = enhance(PureOfferingsFilter) as React.ComponentType<{}>;
