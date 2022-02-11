import { FunctionComponent } from 'react';
import { Row } from 'react-bootstrap';
import { reduxForm } from 'redux-form';

import { getInitialValues, syncFiltersToURL } from '@waldur/core/filters';
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
  onChange: syncFiltersToURL,
  initialValues: getInitialValues({
    state: getStates()[1],
  }),
});

export const SupportResourcesFilter = enhance(PureSupportResourcesFilter);
