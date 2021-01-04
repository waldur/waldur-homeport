import { FunctionComponent } from 'react';
import { connect } from 'react-redux';

import { Link } from '@waldur/core/Link';
import { RootState } from '@waldur/store/reducers';
import { getWorkspace } from '@waldur/workspace/selectors';
import {
  ORGANIZATION_WORKSPACE,
  PROJECT_WORKSPACE,
  SUPPORT_WORKSPACE,
} from '@waldur/workspace/types';

type StateProps = ReturnType<typeof mapStateToProps>;

const PureOrderItemDetailsLink: FunctionComponent<StateProps & OwnProps> = (
  props,
) => (
  <Link
    state={props.state}
    params={{ ...props.params, order_item_uuid: props.order_item_uuid }}
    className={props.className}
    onClick={props.onClick}
  >
    {props.children}
  </Link>
);

interface OwnProps {
  order_item_uuid: string;
  customer_uuid?: string;
  project_uuid?: string;
  className?: string;
  onClick?: () => void;
}

const mapStateToProps = (state: RootState, ownProps: OwnProps) => {
  const workspace = getWorkspace(state);
  if (workspace === ORGANIZATION_WORKSPACE) {
    return {
      state: 'marketplace-order-item-details-customer',
    };
  } else if (workspace === PROJECT_WORKSPACE) {
    return {
      state: 'marketplace-order-list',
      params: {
        uuid: ownProps.project_uuid,
      },
    };
  } else if (workspace === SUPPORT_WORKSPACE) {
    return {
      state: 'marketplace-order-item-details-customer',
      params: {
        uuid: ownProps.customer_uuid,
      },
    };
  }
};

export const OrderItemDetailsLink = connect(mapStateToProps)(
  PureOrderItemDetailsLink,
);
