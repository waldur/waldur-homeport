import React from 'react';
import { Row } from 'react-bootstrap';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { reduxForm } from 'redux-form';

import { RootState } from '@waldur/store/reducers';
import { getCustomer } from '@waldur/workspace/selectors';
import { Customer } from '@waldur/workspace/types';

import { CategoryFilter } from './CategoryFilter';
import { ProjectFilter } from './ProjectFilter';
import { getStates, ResourceStateFilter } from './ResourceStateFilter';

interface CustomerResourcesFilterProps {
  customer: Customer;
}

const PureCustomerResourcesFilter: React.FC<CustomerResourcesFilterProps> = (
  props,
) => (
  <Row>
    <ProjectFilter customer_uuid={props.customer.uuid} />
    <CategoryFilter />
    <ResourceStateFilter />
  </Row>
);

const mapStateToProps = (state: RootState) => ({
  customer: getCustomer(state),
});

const enhance = compose(
  reduxForm({
    form: 'CustomerResourcesFilter',
    initialValues: {
      state: getStates()[1],
    },
  }),
  connect(mapStateToProps),
);

export const CustomerResourcesFilter = enhance(PureCustomerResourcesFilter);
