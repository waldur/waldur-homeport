import { useCurrentStateAndParams } from '@uirouter/react';
import React, { FunctionComponent } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useAsyncFn, useInterval, useNetwork } from 'react-use';

import { ENV } from '@waldur/configs/default';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { getOrderDetails } from '@waldur/marketplace/common/api';
import { OrderSummary } from '@waldur/marketplace/orders/OrderSummary';
import { useTitle } from '@waldur/navigation/title';

import { ApproveButton } from './ApproveButton';
import { Order } from './Order';
import { OrderSteps } from './OrderSteps';
import { RejectButton } from './RejectButton';
import { StatusChange, OrderStep } from './types';

interface OrderDetailsProps {
  approveOrder: (orderUuid: string) => void;
  rejectOrder: (orderUuid: string) => void;
  stateChangeStatus: StatusChange;
  orderCanBeApproved?: boolean;
}

async function loadOrder(order_uuid) {
  const order = await getOrderDetails(order_uuid);
  return {
    order,
    step: order.state === 'requested for approval' ? 'Approve' : 'Review',
    items: order.items,
    total_cost: order.total_cost,
    file: order.file,
    project_uuid: order.project_uuid,
    customer_uuid: order.customer_uuid,
  };
}

const OrderRefreshButton: FunctionComponent<any> = (props) => (
  <button
    type="button"
    className="btn btn-default btn-sm m-r-sm"
    onClick={props.loadData}
  >
    <i className="fa fa-refresh" /> {translate('Refresh')}
  </button>
);

export const OrderDetails: React.FC<OrderDetailsProps> = (props) => {
  useTitle(translate('Order details'));
  const {
    params: { order_uuid },
  } = useCurrentStateAndParams();

  const [{ loading, error, value }, loadData] = useAsyncFn(
    () => loadOrder(order_uuid),
    [props.stateChangeStatus, order_uuid],
  );

  const oldValue = React.useRef<any>();

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  React.useEffect(() => {
    oldValue.current = value;
  }, [value]);

  const { online } = useNetwork();

  const pullInterval =
    online && value?.order?.state === 'executing'
      ? ENV.defaultPullInterval * 1000
      : null;
  // Refresh order details until it is switched from pending state to terminal state
  useInterval(loadData, pullInterval);

  // Don't render loading indicator if order item is refreshing
  // since if it is in pending state it is refreshed via periodic polling
  if (loading && !oldValue.current) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <h3 className="text-center">
        {translate('Unable to load order details.')}
      </h3>
    );
  }

  const data = value || oldValue.current;
  if (data) {
    return (
      <Row>
        <Col lg={8}>
          <OrderSteps step={data.step as OrderStep} />
          <Order
            items={data.items}
            project_uuid={data.project_uuid}
            customer_uuid={data.customer_uuid}
            editable={false}
          />
          <div className="text-right">
            <OrderRefreshButton loadData={loadData} />
            {props.orderCanBeApproved && data.step === 'Approve' && (
              <>
                <ApproveButton
                  submitting={props.stateChangeStatus.approving}
                  onClick={() => props.approveOrder(order_uuid)}
                  tooltip={translate(
                    'You need approval to finish purchasing of services.',
                  )}
                  className="btn btn-primary btn-sm m-r-xs"
                />
                <RejectButton
                  submitting={props.stateChangeStatus.rejecting}
                  onClick={() => props.rejectOrder(order_uuid)}
                />
              </>
            )}
          </div>
        </Col>
        <Col lg={4}>
          <OrderSummary total={data.total_cost} file={data.file} />
        </Col>
      </Row>
    );
  }
  return null;
};
