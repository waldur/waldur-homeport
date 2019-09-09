import * as React from 'react';
import * as Col from 'react-bootstrap/lib/Col';
import * as Row from 'react-bootstrap/lib/Row';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { Query } from '@waldur/core/Query';
import { $state } from '@waldur/core/services';
import { useInterval } from '@waldur/core/useInterval';
import { getUUID } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { getOrderDetails } from '@waldur/marketplace/common/api';
import { OrderSummary } from '@waldur/marketplace/orders/OrderSummary';

import { ApproveButton } from './ApproveButton';
import { Order } from './Order';
import { OrderSteps } from './OrderSteps';
import { RejectButton } from './RejectButton';
import { StatusChange } from './types';

interface OrderDetailsProps {
  approveOrder: (orderUuid: string) => void;
  rejectOrder: (orderUuid: string) => void;
  stateChangeStatus: StatusChange;
  orderCanBeApproved?: boolean;
}

async function loadOrder() {
  const order = await getOrderDetails($state.params.order_uuid);
  return {
    order,
    step: order.state === 'requested for approval' ? 'Approve' : 'Review',
    items: order.items,
    total_cost: order.total_cost,
    file: order.file,
    project_uuid: getUUID(order.project),
  };
}

const OrderRefreshButton = props => (
  <button
    type="button"
    className="btn btn-default btn-sm m-r-sm"
    onClick={props.loadData}
  >
    <i className="fa fa-refresh"/>
    {' '}
    {translate('Refresh')}
  </button>
);

const OrderDetailsComponent = props => {
  // Refresh order details each 5 seconds until it is switched from pending state to terminal state
  useInterval(props.loadData, props.data.order.state === 'executing' ? 5000 : null);
  return (
    <Row>
      <Col lg={8}>
        <OrderSteps step={props.data.step} />
        <Order
          items={props.data.items}
          project_uuid={props.data.project_uuid}
          editable={false}
        />
        <div className="text-right">
          <OrderRefreshButton loadData={props.loadData}/>
          {props.orderCanBeApproved && props.data.step === 'Approve' && (
            <>
              <ApproveButton
                submitting={props.stateChangeStatus.approving}
                onClick={() => props.approveOrder($state.params.order_uuid)}
                tooltip={translate('You need approval to finish purchasing of services.')}
                className="btn btn-primary btn-sm m-r-xs"
              />
              <RejectButton
                submitting={props.stateChangeStatus.rejecting}
                onClick={() => props.rejectOrder($state.params.order_uuid)}
              />
            </>
          )}
        </div>
      </Col>
      <Col lg={4}>
        <OrderSummary
          total={props.data.total_cost}
          file={props.data.file}
        />
      </Col>
    </Row>
  );
};

export const OrderDetails: React.SFC<OrderDetailsProps> = props => (
  <Query variables={props.stateChangeStatus} loader={loadOrder}>
    {({ loading, loaded, error, data, loadData }) => {
      // Don't render loading indicator if order item is refreshing
      // since if it is in pending state it is refreshed via periodic polling
      if (loading && !loaded) {
        return <LoadingSpinner/>;
      }
      if (error) {
        return (
          <h3 className="text-center">
            {translate('Unable to load order details.')}
          </h3>
        );
      }
      return <OrderDetailsComponent {...props} data={data} loadData={loadData}/>;
    }}
  </Query>
);
