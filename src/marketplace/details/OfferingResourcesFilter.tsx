import * as React from 'react';
import * as Row from 'react-bootstrap/lib/Row';
import { reduxForm } from 'redux-form';

import { FILTER_OFFERING_RESOURCE } from '@waldur/marketplace/details/constants';
import { ResourceStateFilter } from '@waldur/marketplace/resources/list/ResourceStateFilter';

const PureOfferingResourcesFilter = () => (
  <Row>
    <ResourceStateFilter />
  </Row>
);

const enhance = reduxForm({
  form: FILTER_OFFERING_RESOURCE,
  initialValues: { state: { value: 'OK', label: 'OK' } },
});

export const OfferingResourcesFilter = enhance(
  PureOfferingResourcesFilter,
) as React.ComponentType<{}>;
