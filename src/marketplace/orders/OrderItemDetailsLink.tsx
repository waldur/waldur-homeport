import * as React from 'react';
import { connect } from 'react-redux';

import { Link } from '@waldur/core/Link';
import { getWorkspace } from '@waldur/workspace/selectors';

const PureOrderItemDetailsLink = props => (
  <Link
    state={props.state}
    params={{order_item_uuid: props.order_item_uuid}}
    className={props.className}>
    {props.children}
  </Link>
);

const connector = connect<{state: string}, {}, {order_item_uuid: string, className?: string}>(state => {
  const workspace = getWorkspace(state);
  if (workspace === 'organization') {
    return {
      state: 'marketplace-order-item-details-customer',
    };
  } else {
    return {
      state: 'marketplace-order-item-details',
    };
  }
});

export const OrderItemDetailsLink = connector(PureOrderItemDetailsLink);
