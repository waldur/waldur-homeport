import { FunctionComponent } from 'react';
import { connect } from 'react-redux';

import { Link } from '@waldur/core/Link';
import { RootState } from '@waldur/store/reducers';
import { getWorkspace } from '@waldur/workspace/selectors';
import { PROJECT_WORKSPACE } from '@waldur/workspace/types';

const PureOrderDetailsLink: FunctionComponent<any> = (props) => (
  <Link
    state={props.state}
    params={{ ...props.params, order_uuid: props.order_uuid }}
    className={props.className}
    onClick={props.onClick}
  >
    {props.children}
  </Link>
);

interface StateProps {
  state: string;
}

interface OwnProps {
  order_uuid: string;
  customer_uuid?: string;
  project_uuid?: string;
  className?: string;
  onClick?: () => void;
}

const connector = connect<StateProps, {}, OwnProps, RootState>(
  (state, ownProps) => {
    const workspace = getWorkspace(state);
    if (workspace === PROJECT_WORKSPACE) {
      return {
        state: 'marketplace-order-details-project',
        params: {
          uuid: ownProps.project_uuid,
        },
      };
    } else {
      return {
        state: 'marketplace-order-details-customer',
        params: {
          uuid: ownProps.customer_uuid,
        },
      };
    }
  },
);

export const OrderDetailsLink = connector(PureOrderDetailsLink);
