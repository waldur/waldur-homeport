import * as React from 'react';
import { connect } from 'react-redux';

import { Link } from '@waldur/core/Link';
import { getWorkspace } from '@waldur/workspace/selectors';
import { OuterState } from '@waldur/workspace/types';

const PureLandingLink = props => (
  <Link state={props.state}>{props.children}</Link>
);

const connector = connect<{ state: string }, {}, {}, OuterState>(state => {
  const workspace = getWorkspace(state);
  if (workspace === 'organization') {
    return {
      state: 'marketplace-landing-customer',
    };
  } else {
    return {
      state: 'marketplace-landing',
    };
  }
});

export const LandingLink = connector(PureLandingLink);
