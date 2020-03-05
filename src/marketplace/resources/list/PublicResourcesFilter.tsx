import * as React from 'react';
import * as Row from 'react-bootstrap/lib/Row';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { reduxForm } from 'redux-form';
import { createSelector } from 'reselect';

import { OfferingAutocomplete } from '@waldur/marketplace/offerings/details/OfferingAutocomplete';
import { OrganizationAutocomplete } from '@waldur/marketplace/orders/OrganizationAutocomplete';
import { getCustomer } from '@waldur/workspace/selectors';

import { CategoryFilter } from './CategoryFilter';
import { ResourceStateFilter } from './ResourceStateFilter';

const PurePublicResourcesFilter = props => (
  <Row>
    <OfferingAutocomplete offeringFilter={props.offeringFilter} />
    <OrganizationAutocomplete />
    <CategoryFilter />
    <ResourceStateFilter />
  </Row>
);

const filterSelector = createSelector(getCustomer, customer => ({
  customer_uuid: customer.uuid,
}));

const mapStateToProps = state => ({
  offeringFilter: filterSelector(state),
});

const enhance = compose(
  reduxForm({ form: 'PublicResourcesFilter' }),
  connect(mapStateToProps),
);

export const PublicResourcesFilter = enhance(
  PurePublicResourcesFilter,
) as React.ComponentType<{}>;
