import * as React from 'react';
import * as Col from 'react-bootstrap/lib/Col';
import * as Row from 'react-bootstrap/lib/Row';

import { getDetailsComponent } from '@waldur/marketplace/common/registry';
import { OfferingTabs } from '@waldur/marketplace/details/OfferingTabs';
import { PlanDetails } from '@waldur/marketplace/details/plan/PlanDetails';
import { Offering, Category } from '@waldur/marketplace/types';

import { OrderItemDetailsHeader } from './OrderItemDetailsHeader';
import { OrderItemDetailsSummary } from './OrderItemDetailsSummary';
import { OrderItemResponse } from './types';

interface OrderItemDetailsProps {
  orderItem: OrderItemResponse;
  offering: Offering;
  category: Category;
}

export const OrderItemDetails = (props: OrderItemDetailsProps) => {
  const DetailsComponent = getDetailsComponent(props.orderItem.offering_type);
  if (!DetailsComponent) {
    return null;
  }
  return (
    <>
      <Row>
        <Col md={9}>
          <OrderItemDetailsHeader orderItem={props.orderItem} offering={props.offering}/>
          <DetailsComponent orderItem={props.orderItem} offering={props.offering}/>
          <PlanDetails orderItem={props.orderItem} offering={props.offering}/>
        </Col>
        <Col md={3}>
          <OrderItemDetailsSummary offering={props.offering}/>
        </Col>
      </Row>
      <OfferingTabs
        offering={props.offering}
        sections={props.category.sections}
      />
    </>
  );
};
