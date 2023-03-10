import { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import { translate } from '@waldur/i18n';
import { IssuesList } from '@waldur/issues/list/IssuesList';
import { getUser } from '@waldur/workspace/selectors';

const mapStateToProps = createSelector(getUser, (user) => ({
  scope: { user },
  filter: { user: user && user.url },
}));

const UserIssuesComponent = connect(mapStateToProps)(IssuesList);

export const UserIssuesTable: FunctionComponent = () => (
  <UserIssuesComponent
    hiddenColumns={['caller', 'time_in_progress']}
    title={translate('User issues')}
    fullWidth
    initialPageSize={5}
  />
);
