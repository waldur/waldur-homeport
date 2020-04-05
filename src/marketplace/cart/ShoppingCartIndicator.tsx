import * as React from 'react';
import { connect } from 'react-redux';

import { NavbarIndicator } from '@waldur/navigation/header/NavbarIndicator';
import { getProject } from '@waldur/workspace/selectors';
import { Project } from '@waldur/workspace/types';

import { getCount } from './store/selectors';

interface CartIndicatorProps {
  count: number;
  project: Project;
}

const PureCartIndicator = (props: CartIndicatorProps) =>
  props.project ? (
    <NavbarIndicator
      state={'marketplace-checkout'}
      params={{ uuid: props.project.uuid }}
      iconClass="fa fa-shopping-cart"
      labelClass="label label-warning"
      count={props.count}
    />
  ) : null;

const mapStateToProps = state => ({
  count: getCount(state),
  project: getProject(state),
});

export const ShoppingCartIndicator = connect(mapStateToProps)(
  PureCartIndicator,
);
