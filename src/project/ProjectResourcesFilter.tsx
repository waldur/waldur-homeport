import { FunctionComponent } from 'react';
import { Row } from 'react-bootstrap';
import { reduxForm } from 'redux-form';

import { CategoryFilter } from '@waldur/marketplace/resources/list/CategoryFilter';
import {
  getStates,
  ResourceStateFilter,
} from '@waldur/marketplace/resources/list/ResourceStateFilter';
import { PROJECT_RESOURCES_FILTER_FORM_ID } from '@waldur/project/constants';

const PureProjectResourcesFilter: FunctionComponent = () => (
  <Row>
    <CategoryFilter />
    <ResourceStateFilter />
  </Row>
);

export const ProjectResourcesFilter = reduxForm({
  form: PROJECT_RESOURCES_FILTER_FORM_ID,
  initialValues: {
    state: getStates()[1],
  },
})(PureProjectResourcesFilter);
