import * as React from 'react';
import { connect } from 'react-redux';

import { Link } from '@waldur/core/Link';
import { getWorkspace } from '@waldur/workspace/selectors';
import { WorkspaceType } from '@waldur/workspace/types';

interface ProviderLinkProps {
  workspace: WorkspaceType;
  customer_uuid: string;
  className?: string;
  children?: React.ReactNode;
}

const PureProviderLink: React.FC<ProviderLinkProps> = props => (
  <Link
    state={
      props.workspace === 'organization'
        ? 'marketplace-provider-details-customer'
        : 'marketplace-provider-details'
    }
    params={{ customer_uuid: props.customer_uuid }}
    className={props.className}
  >
    {props.children}
  </Link>
);

const mapStateToProps = state => ({
  workspace: getWorkspace(state),
});

export const ProviderLink = connect(mapStateToProps)(PureProviderLink);
