import * as React from 'react';
import { connect } from 'react-redux';

import { Query } from '@waldur/core/Query';
import { connectAngularComponent } from '@waldur/store/connect';
import { getUser } from '@waldur/workspace/selectors';
import { OuterState, User } from '@waldur/workspace/types';

import { getIssues } from '../api';
import { IssuesShortListComponent } from './IssuesShortListComponent';
import { Issue } from './types';

const loadUserIssues: (user: User) => Promise<Issue[]> = user =>
  getIssues({ caller: user.url });

interface Props {
  user: User;
}

const connector = connect((state: OuterState) => ({
  user: getUser(state),
}));

export const IssuesShortList = connector((props: Props) => (
  <Query
    loader={loadUserIssues}
    variables={props.user}
    children={IssuesShortListComponent}
  />
));

export default connectAngularComponent(IssuesShortList);
