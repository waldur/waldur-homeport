import * as React from 'react';
import { connect } from 'react-redux';

import { NavbarIndicator } from '@waldur/navigation/header/NavbarIndicator';
import { connectAngularComponent } from '@waldur/store/connect';
import { getWorkspace } from '@waldur/workspace/selectors';
import { WorkspaceType } from '@waldur/workspace/types';

import { getCount } from './store/selectors';

interface ComparisonIndicatorProps {
  count: number;
  workspace: WorkspaceType;
}

const PureComparisonIndicator = (props: ComparisonIndicatorProps) =>
  ['organization', 'project'].indexOf(props.workspace) !== -1  ? (
  <NavbarIndicator
    state={props.workspace === 'organization' ? 'marketplace-compare-customer' : 'marketplace-compare'}
    iconClass="fa fa-balance-scale"
    count={props.count}
  />
) : null;

const mapStateToProps = state => ({
  count: getCount(state),
  workspace: getWorkspace(state),
});

export const ComparisonIndicator = connect(mapStateToProps)(PureComparisonIndicator);

export default connectAngularComponent(ComparisonIndicator);
