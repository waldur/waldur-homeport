import * as React from 'react';
import { connect } from 'react-redux';

import { Link } from '@waldur/core/Link';
import { getWorkspace } from '@waldur/workspace/selectors';
import { OuterState } from '@waldur/workspace/types';

const PureOrderItemDetailsLink = props => (
  <Link
    state={props.state}
    params={{...props.params, order_item_uuid: props.order_item_uuid}}
    className={props.className}
    onClick={props.onClick}>
    {props.children}
  </Link>
);

interface StateProps {
  state: string;
}

interface OwnProps {
  order_item_uuid: string;
  customer_uuid?: string;
  project_uuid?: string;
  className?: string;
  onClick?: () => void;
}

const connector = connect<StateProps, {}, OwnProps, OuterState>((state, ownProps) => {
  const workspace = getWorkspace(state);
  if (workspace === 'organization') {
    return {
      state: 'marketplace-order-item-details-customer',
    };
  } else if (workspace === 'project') {
    return {
      state: 'marketplace-order-list',
      params: {
        uuid: ownProps.project_uuid,
      },
    };
  } else if (workspace === 'support') {
    return {
      state: 'marketplace-order-item-details-customer',
      params: {
        uuid: ownProps.customer_uuid,
      },
    };
  }
});

export const OrderItemDetailsLink = connector(PureOrderItemDetailsLink);
