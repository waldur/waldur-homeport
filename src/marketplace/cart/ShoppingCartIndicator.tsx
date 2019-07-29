import * as React from 'react';
import { connect } from 'react-redux';

import { NavbarIndicator } from '@waldur/navigation/header/NavbarIndicator';
import { connectAngularComponent } from '@waldur/store/connect';
import { getWorkspace } from '@waldur/workspace/selectors';
import { WorkspaceType } from '@waldur/workspace/types';

import { getCount } from './store/selectors';

interface CartIndicatorProps {
  count: number;
  workspace: WorkspaceType;
}

const PureCartIndicator = (props: CartIndicatorProps) =>
props.workspace === 'project' ? (
  <NavbarIndicator
    state={'marketplace-checkout'}
    iconClass="fa fa-shopping-cart"
    labelClass="label label-warning"
    count={props.count}
  />
) : null;

const mapStateToProps = state => ({
  count: getCount(state),
  workspace: getWorkspace(state),
});

export const CartIndicator = connect(mapStateToProps)(PureCartIndicator);

export default connectAngularComponent(CartIndicator);
