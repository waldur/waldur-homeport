import React, { FunctionComponent } from 'react';
import { Row } from 'react-bootstrap';
import { reduxForm } from 'redux-form';

import { OfferingAutocomplete } from '@waldur/marketplace/offerings/details/OfferingAutocomplete';
import { OrganizationAutocomplete } from '@waldur/marketplace/orders/OrganizationAutocomplete';

import { CategoryFilter } from './CategoryFilter';
import { getStates, ResourceStateFilter } from './ResourceStateFilter';

const PureSupportResourcesFilter: FunctionComponent = () => (
  <Row>
    <OfferingAutocomplete />
    <OrganizationAutocomplete />
    <CategoryFilter />
    <ResourceStateFilter />
  </Row>
);

const enhance = reduxForm({
  form: 'SupportResourcesFilter',
  initialValues: {
    state: getStates().find(({ value }) => value === 'OK'),
  },
});

export const SupportResourcesFilter = enhance(PureSupportResourcesFilter);
