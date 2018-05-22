import * as React from 'react';
import { connect } from 'react-redux';

import { NavbarIndicator } from '@waldur/navigation/header/NavbarIndicator';
import { connectAngularComponent } from '@waldur/store/connect';
import { getProject } from '@waldur/workspace/selectors';

import { getCount } from './store/selectors';

const PureComparisonIndicator = props => props.project ? (
  <NavbarIndicator
    state="marketplace-compare"
    iconClass="fa fa-balance-scale"
    count={props.count}
  />
) : null;

const mapStateToProps = state => ({
  count: getCount(state),
  project: getProject(state),
});

export const ComparisonIndicator = connect(mapStateToProps)(PureComparisonIndicator);

export default connectAngularComponent(ComparisonIndicator);
