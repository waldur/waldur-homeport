import * as React from 'react';
import { connect } from 'react-redux';

import { Link } from '@waldur/core/Link';
import { getWorkspace } from '@waldur/workspace/selectors';
import { OuterState } from '@waldur/workspace/types';

interface StateProps {
  state: string;
}

interface OwnProps {
  order_item_uuid: string;
  className?: string;
}

type MergedProps = StateProps & OwnProps;

const PureShoppingCartUpdateLink: React.SFC<MergedProps> = props => (
  <Link
    state={props.state}
    params={{order_item_uuid: props.order_item_uuid}}
    className={props.className}>
    {props.children}
  </Link>
);

const connector = connect<StateProps, {}, OwnProps, OuterState>(state => {
  const workspace = getWorkspace(state);
  if (workspace === 'organization') {
    return {
      state: 'marketplace-shopping-cart-item-update-customer',
    };
  } else {
    return {
      state: 'marketplace-shopping-cart-item-update',
    };
  }
});

export const ShoppingCartItemUpdateLink = connector(PureShoppingCartUpdateLink);
