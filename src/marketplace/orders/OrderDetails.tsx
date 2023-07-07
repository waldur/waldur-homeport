import { useQuery } from '@tanstack/react-query';
import { useCurrentStateAndParams } from '@uirouter/react';
import React from 'react';
import { Col, Row } from 'react-bootstrap';

import { ENV } from '@waldur/configs/default';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { getOrderDetails } from '@waldur/marketplace/common/api';
import { OrderSummary } from '@waldur/marketplace/orders/OrderSummary';
import { useTitle } from '@waldur/navigation/title';

import { OrderActions } from './actions/OrderActions';
import { OrderRefreshButton } from './actions/OrderRefreshButton';
import { Order } from './Order';
import { OrderSteps } from './OrderSteps';
import { OrderStep } from './types';

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

export const OrderDetails: React.FC<{}> = () => {
  useTitle(translate('Order details'));
  const {
    params: { order_uuid },
  } = useCurrentStateAndParams();

  const { isLoading, error, data, refetch } = useQuery(
    ['QueryDetails', order_uuid],
    () => loadOrder(order_uuid),
    {
      refetchInterval: ENV.defaultPullInterval * 1000,
    },
  );

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <h3 className="text-center">
        {translate('Unable to load order details.')}
      </h3>
    );
  }

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
            <OrderRefreshButton loadData={refetch} />
            {data.step === 'Approve' && <OrderActions orderId={order_uuid} />}
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
