import * as React from 'react';
import { connect } from 'react-redux';

import { Link } from '@waldur/core/Link';
import { getWorkspace } from '@waldur/workspace/selectors';
import { OuterState } from '@waldur/workspace/types';

interface StateProps {
  state: string;
}

interface OwnProps {
  offering_uuid: string;
  className?: string;
}

type MergedProps = StateProps & OwnProps;

const PureOfferingLink: React.SFC<MergedProps> = props => (
  <Link
    state={props.state}
    params={{offering_uuid: props.offering_uuid}}
    className={props.className}>
    {props.children}
  </Link>
);

const connector = connect<StateProps, {}, OwnProps, OuterState>(state => {
  const workspace = getWorkspace(state);
  if (workspace === 'organization') {
    return {
      state: 'marketplace-offering-customer',
    };
  } else {
    return {
      state: 'marketplace-offering',
    };
  }
});

export const OfferingLink = connector(PureOfferingLink);
