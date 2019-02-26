import * as React from 'react';
import * as Row from 'react-bootstrap/lib/Row';
import { reduxForm } from 'redux-form';

import { OrganizationAutocomplete } from '@waldur/marketplace/orders/OrganizationAutocomplete';

import { CategoryFilter } from './CategoryFilter';
import { ResourceStateFilter } from './ResourceStateFilter';

const PurePublicResourcesFilter = () => (
  <Row>
    <OrganizationAutocomplete/>
    <CategoryFilter/>
    <ResourceStateFilter/>
  </Row>
);

const enhance = reduxForm({form: 'PublicResourcesFilter'});

export const PublicResourcesFilter = enhance(PurePublicResourcesFilter) as React.ComponentType<{}>;
