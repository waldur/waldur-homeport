import * as React from 'react';
import { connect } from 'react-redux';

import { NavbarIndicator } from '@waldur/navigation/header/NavbarIndicator';
import { connectAngularComponent } from '@waldur/store/connect';
import { getProject } from '@waldur/workspace/selectors';

import { getShoppingCartCount } from './store/selectors';

const PureCartIndicator = props => props.project ? (
  <NavbarIndicator
    state="marketplace-checkout"
    iconClass="fa fa-shopping-cart"
    labelClass="label label-warning"
    count={props.count}
  />
) : null;

const mapStateToProps = state => ({
  count: getShoppingCartCount(state),
  project: getProject(state),
});

export const CartIndicator = connect(mapStateToProps)(PureCartIndicator);

export default connectAngularComponent(CartIndicator);
