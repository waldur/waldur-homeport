import { FunctionComponent } from 'react';
import { connect } from 'react-redux';

import { Link } from '@waldur/core/Link';
import { RootState } from '@waldur/store/reducers';
import { getWorkspace } from '@waldur/workspace/selectors';
import { WorkspaceType } from '@waldur/workspace/types';

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
    const forceProjectLevel = ownProps.project_uuid && !ownProps.customer_uuid;
    if (
      forceProjectLevel ||
      (workspace === WorkspaceType.PROJECT && ownProps.project_uuid)
    ) {
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
