import { connect } from 'react-redux';

import { getUser, getCustomer } from '@waldur/workspace/selectors';
import { OuterState } from '@waldur/workspace/types';

import { CustomerDashboard } from './CustomerDashboard';

const mapStateToProps = (state: OuterState) => ({
  user: getUser(state),
  customer: getCustomer(state),
});

export const CustomerDashboardContainer = connect(mapStateToProps)(
  CustomerDashboard,
);
