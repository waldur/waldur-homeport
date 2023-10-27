import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import { IssuesList } from '@waldur/issues/list/IssuesList';
import { getUser } from '@waldur/workspace/selectors';

const mapStateToProps = createSelector(getUser, (user) => ({
  scope: { user },
  filter: { user: user && user.url },
}));

export const UserIssuesList = connect(mapStateToProps)(IssuesList);
