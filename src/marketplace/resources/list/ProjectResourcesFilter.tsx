import * as React from 'react';
import * as Row from 'react-bootstrap/lib/Row';
import { reduxForm } from 'redux-form';

import { ProviderAutocomplete } from '@waldur/marketplace/orders/ProviderAutocomplete';

import { ResourceStateFilter } from './ResourceStateFilter';

const PureProjectResourcesFilter = () => (
  <Row>
    <ResourceStateFilter />
    <ProviderAutocomplete />
  </Row>
);

export const ProjectResourcesFilter = reduxForm({
  form: 'ProjectResourcesFilter',
})(PureProjectResourcesFilter) as React.ComponentType<{}>;
