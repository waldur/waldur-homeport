import * as React from 'react';
import { connect } from 'react-redux';

import { getCartCount } from '@waldur/marketplace/store/selectors';
import { NavbarIndicator } from '@waldur/navigation/header/NavbarIndicator';
import { connectAngularComponent } from '@waldur/store/connect';
import { getProject } from '@waldur/workspace/selectors';

const PureCartIndicator = props => props.project ? (
  <NavbarIndicator
    state="marketplace-checkout"
    iconClass="fa fa-shopping-cart"
    count={props.count}
  />
) : null;

const mapStateToProps = state => ({
  count: getCartCount(state),
  project: getProject(state),
});

export const CartIndicator = connect(mapStateToProps)(PureCartIndicator);

export default connectAngularComponent(CartIndicator);
