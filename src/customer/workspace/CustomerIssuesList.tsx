import { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import { translate } from '@waldur/i18n';
import { IssuesList } from '@waldur/issues/list/IssuesList';
import { useTitle } from '@waldur/navigation/title';
import { getCustomer } from '@waldur/workspace/selectors';

const mapStateToProps = createSelector(getCustomer, (customer) => ({
  scope: { customer },
  filter: { customer: customer && customer.url },
}));

const CustomerIssuesListComponent = connect(mapStateToProps)(IssuesList);

export const CustomerIssuesList: FunctionComponent = () => {
  useTitle(translate('Issues'));
  return <CustomerIssuesListComponent hiddenColumns={['customer']} />;
};
