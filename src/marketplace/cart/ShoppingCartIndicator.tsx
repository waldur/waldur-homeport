import * as React from 'react';
import { connect } from 'react-redux';

import { NavbarIndicator } from '@waldur/navigation/header/NavbarIndicator';
import { connectAngularComponent } from '@waldur/store/connect';
import { getWorkspace, getProject } from '@waldur/workspace/selectors';
import { WorkspaceType, Project } from '@waldur/workspace/types';

import { getCount } from './store/selectors';

interface CartIndicatorProps {
  count: number;
  workspace: WorkspaceType;
  project: Project;
}

const PureCartIndicator = (props: CartIndicatorProps) =>
props.workspace === 'project' ? (
  <NavbarIndicator
    state={'marketplace-checkout'}
    params={{uuid: props.project.uuid}}
    iconClass="fa fa-shopping-cart"
    labelClass="label label-warning"
    count={props.count}
  />
) : null;

const mapStateToProps = state => ({
  count: getCount(state),
  workspace: getWorkspace(state),
  project: getProject(state),
});

export const CartIndicator = connect(mapStateToProps)(PureCartIndicator);

export default connectAngularComponent(CartIndicator);
