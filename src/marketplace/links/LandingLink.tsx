import { FunctionComponent } from 'react';
import { connect } from 'react-redux';

import { Link } from '@waldur/core/Link';
import { RootState } from '@waldur/store/reducers';
import { getWorkspace } from '@waldur/workspace/selectors';
import { ORGANIZATION_WORKSPACE } from '@waldur/workspace/types';

const mapStateToProps = (state: RootState) => {
  const workspace = getWorkspace(state);
  if (workspace === ORGANIZATION_WORKSPACE) {
    return {
      state: 'marketplace-landing-customer',
    };
  } else {
    return {
      state: 'marketplace-landing',
    };
  }
};

const PureLandingLink: FunctionComponent<ReturnType<typeof mapStateToProps>> = (
  props,
) => <Link state={props.state}>{props.children}</Link>;

export const LandingLink = connect(mapStateToProps)(PureLandingLink);
