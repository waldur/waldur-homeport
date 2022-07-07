import { FunctionComponent } from 'react';
import { Row } from 'react-bootstrap';
import { reduxForm } from 'redux-form';

import { OfferingAutocomplete } from '@waldur/marketplace/offerings/details/OfferingAutocomplete';
import { PROJECT_RESOURCES_ALL_FILTER_FORM_ID } from '@waldur/marketplace/resources/list/constants';

import { CategoryFilter } from './CategoryFilter';
import { ResourceStateFilter } from './ResourceStateFilter';

const PureProjectResourcesAllFilter: FunctionComponent<{}> = () => (
  <Row>
    <OfferingAutocomplete />
    <CategoryFilter />
    <ResourceStateFilter />
  </Row>
);

const enhance = reduxForm({
  form: PROJECT_RESOURCES_ALL_FILTER_FORM_ID,
  destroyOnUnmount: false,
});

export const ProjectResourcesAllFilter = enhance(PureProjectResourcesAllFilter);
