import { connect } from 'react-redux';

import { connectAngularComponent } from '@waldur/store/connect';
import { getUser, getCustomer } from '@waldur/workspace/selectors';
import { OuterState } from '@waldur/workspace/types';

import { CustomerDashboard } from './CustomerDashboard';

const mapStateToProps = (state: OuterState) => ({
  user: getUser(state),
  customer: getCustomer(state),
});

const CustomerDashboardContainer = connect(mapStateToProps)(CustomerDashboard);

export default connectAngularComponent(CustomerDashboardContainer);
