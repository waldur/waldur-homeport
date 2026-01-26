import { FC } from 'react';
import { Col, Row } from 'react-bootstrap';
import { OrderStatsResponse } from 'waldur-js-client';

import { OrdersDailyCostChart } from './OrdersDailyCostChart';
import { OrdersDailyTypeChart } from './OrdersDailyTypeChart';
import { OrdersStateChart } from './OrdersStateChart';
import { OrdersSummaryCards } from './OrdersSummaryCards';
import { OrdersTrendChart } from './OrdersTrendChart';
import { OrdersTypeChart } from './OrdersTypeChart';

interface OrdersContentProps {
  data: OrderStatsResponse;
}

export const OrdersContent: FC<OrdersContentProps> = ({ data }) => {
  return (
    <>
      <OrdersSummaryCards stats={data.summary} />

      <Row className="g-4 mb-6">
        <Col xs={12}>
          <OrdersTrendChart dailyStats={data.daily} />
        </Col>
      </Row>

      <Row className="g-4 mb-6">
        <Col xs={12}>
          <OrdersDailyCostChart dailyStats={data.daily} />
        </Col>
      </Row>

      <Row className="g-4 mb-6">
        <Col xs={12}>
          <OrdersDailyTypeChart dailyStats={data.daily} />
        </Col>
      </Row>

      <Row className="g-4">
        <Col xs={12} lg={6}>
          <OrdersStateChart stateStats={data.by_state} />
        </Col>
        <Col xs={12} lg={6}>
          <OrdersTypeChart typeStats={data.by_type} />
        </Col>
      </Row>
    </>
  );
};
