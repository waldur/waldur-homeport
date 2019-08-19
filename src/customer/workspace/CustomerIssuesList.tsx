import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import { IssuesList } from '@waldur/issues/list/IssuesList';
import { connectAngularComponent } from '@waldur/store/connect';
import { getCustomer } from '@waldur/workspace/selectors';

const mapStateToProps = createSelector(
  getCustomer,
  customer => ({
    scope: {customer},
    filter: {customer: customer && customer.url},
  }),
);

const CustomerIssuesList = connect(mapStateToProps)(IssuesList);

export default connectAngularComponent(CustomerIssuesList);
