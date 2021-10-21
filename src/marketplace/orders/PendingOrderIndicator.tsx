import { DateTime } from 'luxon';
import { FunctionComponent, Component } from 'react';
import {
  Col,
  Dropdown,
  DropdownMenu,
  DropdownToggle,
  Row,
} from 'react-bootstrap';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { toggleOpen, ToggleOpenProps } from '@waldur/core/HOC/toggleOpen';
import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { getLabel } from '@waldur/marketplace/common/registry';
import * as actions from '@waldur/marketplace/orders/store/actions';
import { RootState } from '@waldur/store/reducers';
import {
  getCustomer,
  isOwnerOrStaff,
  getWorkspace,
} from '@waldur/workspace/selectors';
import {
  Customer,
  ORGANIZATION_WORKSPACE,
  PROJECT_WORKSPACE,
} from '@waldur/workspace/types';

import { OrderDetailsLink } from './OrderDetailsLink';
import './PendingOrderIndicator.scss';
import { OrderItemDetailsType, OrderItemType } from './types';

interface PendingOrderIndicatorProps extends ToggleOpenProps {
  fetchPendingOrders(params: any): void;
  pendingOrders: OrderItemDetailsType[];
  isOwnerOrStaff: boolean;
  customer: Customer;
  count: number;
  workspace: string;
}

export class PurePendingOrderIndicator extends Component<PendingOrderIndicatorProps> {
  componentDidMount() {
    const { workspace, customer } = this.props;
    if (!customer) {
      return;
    }
    if (
      workspace === ORGANIZATION_WORKSPACE ||
      workspace === PROJECT_WORKSPACE
    ) {
      this.fetchData();
    }
  }

  shouldComponentUpdate(props) {
    return this.isValidWorkspace(props);
  }

  isValidWorkspace(props) {
    const { workspace } = props;
    return (
      workspace === ORGANIZATION_WORKSPACE || workspace === PROJECT_WORKSPACE
    );
  }

  componentDidUpdate(prevProps) {
    if (!this.props.customer) {
      return;
    }
    if (this.props.workspace !== prevProps.workspace) {
      this.fetchData();
    }
  }

  fetchData() {
    const { props } = this;
    const params = {
      o: '-created',
      customer_uuid: props.customer.uuid,
      state: 'requested for approval',
    };
    props.fetchPendingOrders(params);
  }

  render() {
    if (!this.isValidWorkspace(this.props)) {
      return null;
    }
    const { isOpen, handleToggleOpen, workspace, pendingOrders } = this.props;
    const count = pendingOrders.length;
    const limitedOrders = pendingOrders.slice(0, 5);
    if (!count || !isOwnerOrStaff) {
      return null;
    }
    return (
      <Dropdown
        open={isOpen}
        onToggle={handleToggleOpen}
        className="PendingOrderDropdown"
        id="pending-dropdown"
      >
        <DropdownToggle noCaret={true} className="PendingOrderDropdown__Toggle">
          <li className="navbar-indicator">
            <a onClick={handleToggleOpen}>
              <i className={'fa fa-bell'} />
              {count > 0 && (
                <span className={'label label-warning'}>{count}</span>
              )}
            </a>
          </li>
        </DropdownToggle>
        <DropdownMenu className="dropdown-orders dropdown-menu-right">
          {limitedOrders.map((order) => (
            <PendingOrderDropdownItem
              key={order.uuid}
              order={order}
              {...this.props}
              onClick={handleToggleOpen}
            />
          ))}

          <li>
            <div className="text-center link-block">
              <ShowAllLink
                handleToggleOpen={handleToggleOpen}
                workspace={workspace}
              />
            </div>
          </li>
        </DropdownMenu>
      </Dropdown>
    );
  }
}

const getNamePrefix = (type: OrderItemType) => {
  switch (type) {
    case 'Create':
      return translate('Pending approval for creation of');
    case 'Update':
      return translate('Pending approval for changing of');
    case 'Terminate':
      return translate('Pending approval for removal of');
    default:
      return null;
  }
};

const PendingOrderDropdownItem: FunctionComponent<any> = (props) => (
  <>
    <li>
      <OrderDetailsLink
        order_uuid={props.order.uuid}
        customer_uuid={props.customer.uuid}
        project_uuid={props.order.project_uuid}
        className="dropdown-item"
        onClick={props.onClick}
      >
        <div>
          {props.order.items.map((item) => (
            <div key={item.uuid}>
              <p>
                <>{getNamePrefix(item.type)} </>
                <strong>{item.attributes.name || item.resource_name}</strong>
              </p>
              <span className="display-flex text-muted small">
                {getLabel(item.offering_type)}
              </span>
            </div>
          ))}
          <Row>
            <Col sm={7}>
              <small>
                {translate('Requested by')} {props.order.created_by_full_name}
              </small>
            </Col>
            <Col sm={5} className="text-right">
              <small>
                {DateTime.fromISO(props.order.created).toRelative()}
              </small>
            </Col>
          </Row>
        </div>
      </OrderDetailsLink>
    </li>
    <li className="dropdown-divider" />
  </>
);

const ShowAllLink = (props) => {
  const { workspace, handleToggleOpen } = props;
  switch (workspace) {
    case ORGANIZATION_WORKSPACE:
      return (
        <Link
          state="marketplace-my-order-items"
          params={{ filterState: 'pending' }}
          onClick={handleToggleOpen}
        >
          <strong>{translate('Show all')}</strong>
        </Link>
      );
    case PROJECT_WORKSPACE:
      return (
        <Link
          state="marketplace-order-list"
          params={{ filterState: 'pending' }}
          onClick={handleToggleOpen}
        >
          <strong>{translate('Show all')}</strong>
        </Link>
      );
    default:
      return null;
  }
};

const mapStateToProps = (state: RootState) => {
  const { pendingOrders } = state.marketplace.orders;
  return {
    customer: getCustomer(state),
    isOwnerOrStaff: isOwnerOrStaff(state),
    pendingOrders,
    workspace: getWorkspace(state),
  };
};

const mapDispatchToProps = (dispatch) => ({
  fetchPendingOrders: (params) => dispatch(actions.fetchPendingOrders(params)),
});

const enhance = compose(
  toggleOpen,
  connect(mapStateToProps, mapDispatchToProps),
);

export const PendingOrderIndicator = enhance(PurePendingOrderIndicator);
