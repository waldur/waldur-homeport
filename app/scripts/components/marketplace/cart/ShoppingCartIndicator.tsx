import * as React from 'react';
import { connect } from 'react-redux';

import { NavbarIndicator } from '@waldur/navigation/header/NavbarIndicator';
import { connectAngularComponent } from '@waldur/store/connect';
import { getProject, getWorkspace } from '@waldur/workspace/selectors';
import { Project, WorkspaceType } from '@waldur/workspace/types';

import { getCount } from './store/selectors';

interface CartIndicatorProps {
  count: number;
  project?: Project;
  workspace: WorkspaceType;
}

const PureCartIndicator = (props: CartIndicatorProps) => props.project ? (
  <NavbarIndicator
    state={props.workspace === 'organization' ? 'marketplace-checkout-customer' : 'marketplace-checkout'}
    iconClass="fa fa-shopping-cart"
    labelClass="label label-warning"
    count={props.count}
  />
) : null;

const mapStateToProps = state => ({
  count: getCount(state),
  project: getProject(state),
  workspace: getWorkspace(state),
});

export const CartIndicator = connect(mapStateToProps)(PureCartIndicator);

export default connectAngularComponent(CartIndicator);
