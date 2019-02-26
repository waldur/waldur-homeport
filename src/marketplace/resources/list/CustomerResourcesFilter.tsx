import * as React from 'react';
import * as Row from 'react-bootstrap/lib/Row';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { reduxForm } from 'redux-form';

import { getCustomer } from '@waldur/workspace/selectors';
import { Customer } from '@waldur/workspace/types';

import { CategoryFilter } from './CategoryFilter';
import { ProjectFilter } from './ProjectFilter';
import { ResourceStateFilter } from './ResourceStateFilter';

interface CustomerResourcesFilterProps {
  customer: Customer;
}

const PureCustomerResourcesFilter: React.SFC<CustomerResourcesFilterProps> = props => (
  <Row>
    <ProjectFilter customer_uuid={props.customer.uuid}/>
    <CategoryFilter/>
    <ResourceStateFilter/>
  </Row>
);

const mapStateToProps = state => ({
  customer: getCustomer(state),
});

const enhance = compose(
  reduxForm({form: 'CustomerResourcesFilter'}),
  connect(mapStateToProps),
);

export const CustomerResourcesFilter = enhance(PureCustomerResourcesFilter) as React.ComponentType<{}>;
