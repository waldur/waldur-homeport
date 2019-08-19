import * as React from 'react';
import * as Row from 'react-bootstrap/lib/Row';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { reduxForm } from 'redux-form';

import { ProjectFilter } from '@waldur/marketplace/resources/list/ProjectFilter';
import { getCustomer } from '@waldur/workspace/selectors';
import { Customer } from '@waldur/workspace/types';

import { OrderStateFilter } from './OrderStateFilter';
import { OrderTypeFilter } from './OrderTypeFilter';

interface StateProps {
  customer: Customer;
}

const PureMyOrderItemsFilter = (props: StateProps) => (
  <Row>
    <ProjectFilter customer_uuid={props.customer.uuid}/>
    <OrderStateFilter/>
    <OrderTypeFilter/>
  </Row>
);

const mapStateToProps = state => ({
  customer: getCustomer(state),
});

const enhance = compose(
  reduxForm({form: 'MyOrderItemsFilter'}),
  connect(mapStateToProps),
);

export const MyOrderItemsFilter = enhance(PureMyOrderItemsFilter) as React.ComponentType<{}>;
