import * as React from 'react';
import { connect } from 'react-redux';

import { Link } from '@waldur/core/Link';
import { getComparisonCount } from '@waldur/marketplace/store/selectors';
import { connectAngularComponent } from '@waldur/store/connect';
import { getProject } from '@waldur/workspace/selectors';

const PureComparisonIndicator = props => props.project ? (
  <li style={{ marginRight: '0px' }}>
    <Link
      state="marketplace-compare"
      className="count-info position-relative"
      label={
        <>
          <i className="fa fa-balance-scale"/>
          <span className="label label-primary">{props.count}</span>
        </>
      }
    />
  </li>
) : null;

const mapStateToProps = state => ({
  count: getComparisonCount(state),
  project: getProject(state),
});

export const ComparisonIndicator = connect(mapStateToProps)(PureComparisonIndicator);

export default connectAngularComponent(ComparisonIndicator);
