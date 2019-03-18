import * as React from 'react';
import * as Col from 'react-bootstrap/lib/Col';
import * as Panel from 'react-bootstrap/lib/Panel';
import * as PanelGroup from 'react-bootstrap/lib/PanelGroup';
import * as Row from 'react-bootstrap/lib/Row';

import { translate } from '@waldur/i18n';
import { getDetailsComponent } from '@waldur/marketplace/common/registry';
import { PlanDetails } from '@waldur/marketplace/details/plan/PlanDetails';
import { OrderItemDetailsProps } from '@waldur/marketplace/types';

import { OrderItemDetailsField } from './OrderItemDetailsField';
import { OrderItemDetailsHeader } from './OrderItemDetailsHeader';
import { OrderItemDetailsSummary } from './OrderItemDetailsSummary';
import { OrderItemSummary } from './OrderItemSummary';
import { OrderItemTypeIndicator } from './OrderItemTypeIndicator';

export const OrderItemDetails = (props: OrderItemDetailsProps) => {
  const DetailsComponent = getDetailsComponent(props.orderItem.offering_type);
  return (
    <Row>
      <Col md={9}>
        <PanelGroup accordion={true} id="order-item-details" defaultActiveKey="summary">
          <Panel eventKey="summary">
            <Panel.Heading>
              <Panel.Title toggle={true}>
                {translate('Summary')}
              </Panel.Title>
            </Panel.Heading>
            <Panel.Body collapsible={true}>
              <OrderItemDetailsField label={translate('Description')}>
                <OrderItemSummary orderItem={props.orderItem}/>
              </OrderItemDetailsField>
              <OrderItemDetailsField label={translate('Type')}>
                <OrderItemTypeIndicator orderItemType={props.orderItem.type}/>
              </OrderItemDetailsField>
            </Panel.Body>
          </Panel>
          <Panel eventKey="plan">
            <Panel.Heading>
              <Panel.Title toggle={true}>
              {props.orderItem.type === 'Create' ? translate('New plan') : translate('Plan')}
              </Panel.Title>
            </Panel.Heading>
            <Panel.Body collapsible={true}>
              <PlanDetails orderItem={props.orderItem} offering={props.offering}/>
            </Panel.Body>
          </Panel>
          <Panel eventKey="details">
            <Panel.Heading>
              <Panel.Title toggle={true}>
                {translate('Details')}
              </Panel.Title>
            </Panel.Heading>
            <Panel.Body collapsible={true}>
              <OrderItemDetailsHeader orderItem={props.orderItem} offering={props.offering}/>
              {DetailsComponent && <DetailsComponent orderItem={props.orderItem} offering={props.offering}/>}
            </Panel.Body>
          </Panel>
        </PanelGroup>
      </Col>
      <Col md={3}>
        <OrderItemDetailsSummary offering={props.offering}/>
      </Col>
    </Row>
  );
};
