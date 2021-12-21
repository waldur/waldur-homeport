import { Row } from 'react-bootstrap';
import { reduxForm } from 'redux-form';

import { OrganizationAutocomplete } from '@waldur/marketplace/orders/OrganizationAutocomplete';

import { getStates, RequestStateFilter } from './RequestStateFilter';

const Filter = () => (
  <Row>
    <RequestStateFilter />
    <OrganizationAutocomplete />
  </Row>
);

const enhance = reduxForm({
  form: 'OrganizationProjectUpdateRequestListFilter',
  initialValues: {
    state: [getStates()[0]],
  },
});

export const OrganizationProjectUpdateRequestListFilter = enhance(Filter);
