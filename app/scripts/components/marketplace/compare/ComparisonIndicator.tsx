import * as React from 'react';
import { connect } from 'react-redux';

import { NavbarIndicator } from '@waldur/navigation/header/NavbarIndicator';
import { connectAngularComponent } from '@waldur/store/connect';
import { getProject, getWorkspace } from '@waldur/workspace/selectors';
import { Project, WorkspaceType } from '@waldur/workspace/types';

import { getCount } from './store/selectors';

interface ComparisonIndicatorProps {
  count: number;
  project?: Project;
  workspace: WorkspaceType;
}

const PureComparisonIndicator = (props: ComparisonIndicatorProps) => props.project ? (
  <NavbarIndicator
    state={props.workspace === 'organization' ? 'marketplace-compare-customer' : 'marketplace-compare'}
    iconClass="fa fa-balance-scale"
    count={props.count}
  />
) : null;

const mapStateToProps = state => ({
  count: getCount(state),
  project: getProject(state),
  workspace: getWorkspace(state),
});

export const ComparisonIndicator = connect(mapStateToProps)(PureComparisonIndicator);

export default connectAngularComponent(ComparisonIndicator);
