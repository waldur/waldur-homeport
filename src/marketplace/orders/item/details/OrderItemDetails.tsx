import * as React from 'react';
import * as Col from 'react-bootstrap/lib/Col';
import * as Panel from 'react-bootstrap/lib/Panel';
import * as PanelGroup from 'react-bootstrap/lib/PanelGroup';
import * as Row from 'react-bootstrap/lib/Row';

import { useInterval } from '@waldur/core/useInterval';
import { titleCase } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { getDetailsComponent } from '@waldur/marketplace/common/registry';
import { PlanDetails } from '@waldur/marketplace/details/plan/PlanDetails';
import { ResourceDetailsLink } from '@waldur/marketplace/resources/ResourceDetailsLink';
import { ResourceReference } from '@waldur/marketplace/resources/types';
import { OrderItemDetailsProps } from '@waldur/marketplace/types';

import { OrderItemDetailsField } from './OrderItemDetailsField';
import { OrderItemDetailsHeader } from './OrderItemDetailsHeader';
import { OrderItemDetailsSummary } from './OrderItemDetailsSummary';
import { OrderItemSummary } from './OrderItemSummary';
import { OrderItemTerminateButton } from './OrderItemTerminateButton';
import { OrderItemTypeIndicator } from './OrderItemTypeIndicator';

export const OrderItemDetails = (props: OrderItemDetailsProps & {loadData(): void}) => {
  const DetailsComponent = getDetailsComponent(props.orderItem.offering_type);
  // Refresh order item details each 5 seconds until it is switched from pending state to terminal state
  const pollingDelay = ['pending', 'executing'].includes(props.orderItem.state) ? 5000 : null;
  useInterval(props.loadData, pollingDelay);
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
              <OrderItemDetailsField label={translate('State')}>
                {titleCase(props.orderItem.state)}
              </OrderItemDetailsField>
              {props.orderItem.error_message && (
                <OrderItemDetailsField label={translate('Error message')}>
                  {props.orderItem.error_message}
                </OrderItemDetailsField>
              )}
              {props.orderItem.resource_uuid && (
                <OrderItemDetailsField label={translate('Resource')}>
                  <ResourceDetailsLink item={props.orderItem as ResourceReference}>
                    {translate('Resource link')}
                  </ResourceDetailsLink>
                </OrderItemDetailsField>
              )}
              {props.orderItem.can_terminate && (
                <OrderItemDetailsField label={translate('Actions')}>
                  <OrderItemTerminateButton
                    uuid={props.orderItem.uuid}
                    loadData={props.loadData}
                  />
                </OrderItemDetailsField>
              )}
            </Panel.Body>
          </Panel>
          {props.orderItem.plan && (
            <Panel eventKey="plan">
              <Panel.Heading>
                <Panel.Title toggle={true}>
                {props.orderItem.type === 'Create' ? translate('New plan') : translate('Plan')}
                </Panel.Title>
              </Panel.Heading>
              <Panel.Body collapsible={true}>
                <PlanDetails
                  orderItem={props.orderItem}
                  offering={props.offering}
                  limits={props.limits}
                />
              </Panel.Body>
            </Panel>
          )}
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
