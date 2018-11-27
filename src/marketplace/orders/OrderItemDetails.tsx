import * as React from 'react';
import * as Col from 'react-bootstrap/lib/Col';
import * as Row from 'react-bootstrap/lib/Row';

import { getDetailsComponent } from '@waldur/marketplace/common/registry';
import { PlanDetails } from '@waldur/marketplace/details/plan/PlanDetails';

import { OrderItemDetailsProps } from '../types';
import { OrderItemDetailsHeader } from './OrderItemDetailsHeader';
import { OrderItemDetailsSummary } from './OrderItemDetailsSummary';

export const OrderItemDetails = (props: OrderItemDetailsProps) => {
  const DetailsComponent = getDetailsComponent(props.orderItem.offering_type);
  return (
    <Row>
      <Col md={9}>
        <OrderItemDetailsHeader orderItem={props.orderItem} offering={props.offering}/>
        {DetailsComponent && <DetailsComponent orderItem={props.orderItem} offering={props.offering}/>}
        <PlanDetails orderItem={props.orderItem} offering={props.offering}/>
      </Col>
      <Col md={3}>
        <OrderItemDetailsSummary offering={props.offering}/>
      </Col>
    </Row>
  );
};
