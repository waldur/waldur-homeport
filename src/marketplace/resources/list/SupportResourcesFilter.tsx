import React from 'react';
import { Row } from 'react-bootstrap';
import { reduxForm } from 'redux-form';

import { OfferingAutocomplete } from '@waldur/marketplace/offerings/details/OfferingAutocomplete';
import { OrganizationAutocomplete } from '@waldur/marketplace/orders/OrganizationAutocomplete';

import { CategoryFilter } from './CategoryFilter';
import { ResourceStateFilter } from './ResourceStateFilter';

const PureSupportResourcesFilter = () => (
  <Row>
    <OfferingAutocomplete />
    <OrganizationAutocomplete />
    <CategoryFilter />
    <ResourceStateFilter />
  </Row>
);

const enhance = reduxForm({ form: 'SupportResourcesFilter' });

export const SupportResourcesFilter = enhance(
  PureSupportResourcesFilter,
) as React.ComponentType<{}>;
