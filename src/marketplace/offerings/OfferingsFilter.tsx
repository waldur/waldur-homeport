import { FunctionComponent } from 'react';
import { Row } from 'react-bootstrap';
import { reduxForm } from 'redux-form';

import { PUBLIC_OFFERINGS_FILTER_FORM_ID } from '@waldur/marketplace/offerings/store/constants';

import { OfferingStateFilter, getStates } from './OfferingStateFilter';
const PureOfferingsFilter: FunctionComponent = () => (
  <Row>
    <OfferingStateFilter />
  </Row>
);

const enhance = reduxForm({
  form: PUBLIC_OFFERINGS_FILTER_FORM_ID,
  initialValues: {
    state: [getStates()[0], getStates()[1]],
  },
  destroyOnUnmount: false,
});

export const OfferingsFilter = enhance(PureOfferingsFilter);
