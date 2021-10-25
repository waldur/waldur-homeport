import { memo } from 'react';
import { Col, Panel, PanelGroup, Row } from 'react-bootstrap';

import { formatDate } from '@waldur/core/dateUtils';
import { titleCase } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { getDetailsComponent } from '@waldur/marketplace/common/registry';
import { PlanDetails } from '@waldur/marketplace/details/plan/PlanDetails';
import { ResourceReference } from '@waldur/marketplace/resources/types';
import { OrderItemDetailsProps } from '@waldur/marketplace/types';

import { OrderItemDetailsField } from './OrderItemDetailsField';
import { OrderItemDetailsHeader } from './OrderItemDetailsHeader';
import { OrderItemDetailsResourceLink } from './OrderItemDetailsResourceLink';
import { OrderItemDetailsSummary } from './OrderItemDetailsSummary';
import { OrderItemSummary } from './OrderItemSummary';
import { OrderItemTerminateButton } from './OrderItemTerminateButton';
import { OrderItemTypeIndicator } from './OrderItemTypeIndicator';

let OrderItemDetails = (
  props: OrderItemDetailsProps & { loadData(): void },
) => {
  const DetailsComponent = getDetailsComponent(props.orderItem.offering_type);
  return (
    <Row>
      <Col md={9}>
        <PanelGroup
          accordion={true}
          id="order-item-details"
          defaultActiveKey="summary"
        >
          <Panel eventKey="summary">
            <Panel.Heading>
              <Panel.Title toggle={true}>{translate('Summary')}</Panel.Title>
            </Panel.Heading>
            <Panel.Body collapsible={true}>
              <OrderItemDetailsField label={translate('Description')}>
                <OrderItemSummary
                  orderItem={props.orderItem}
                  offering={props.offering}
                />
              </OrderItemDetailsField>
              <OrderItemDetailsField label={translate('Type')}>
                <OrderItemTypeIndicator orderItem={props.orderItem} />
              </OrderItemDetailsField>
              <OrderItemDetailsField label={translate('State')}>
                {titleCase(props.orderItem.state)}
              </OrderItemDetailsField>
              {props.orderItem.error_message && (
                <OrderItemDetailsField label={translate('Error message')}>
                  {props.orderItem.error_message}
                </OrderItemDetailsField>
              )}
              {props.orderItem.error_traceback && (
                <OrderItemDetailsField label={translate('Error traceback')}>
                  {props.orderItem.error_traceback}
                </OrderItemDetailsField>
              )}
              {props.orderItem.marketplace_resource_uuid && (
                <OrderItemDetailsField label={translate('Resource')}>
                  <OrderItemDetailsResourceLink
                    item={props.orderItem as ResourceReference}
                  >
                    {translate('Resource link')}
                  </OrderItemDetailsResourceLink>
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
              {props.orderItem.reviewed_by && (
                <OrderItemDetailsField label={translate('Reviewed by')}>
                  {props.orderItem.reviewed_by}
                </OrderItemDetailsField>
              )}
              {props.orderItem.reviewed_at && (
                <OrderItemDetailsField label={translate('Reviewed at')}>
                  {formatDate(props.orderItem.reviewed_at)}
                </OrderItemDetailsField>
              )}
            </Panel.Body>
          </Panel>
          {props.orderItem.plan && (
            <Panel eventKey="plan">
              <Panel.Heading>
                <Panel.Title toggle={true}>
                  {props.orderItem.type === 'Create'
                    ? translate('New plan')
                    : translate('Plan')}
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
              <Panel.Title toggle={true}>{translate('Details')}</Panel.Title>
            </Panel.Heading>
            <Panel.Body collapsible={true}>
              <OrderItemDetailsHeader
                orderItem={props.orderItem}
                offering={props.offering}
              />
              {DetailsComponent && (
                <DetailsComponent
                  orderItem={props.orderItem}
                  offering={props.offering}
                />
              )}
              {props.orderItem.output && (
                <OrderItemDetailsField label={translate('Output')}>
                  {props.orderItem.output}
                </OrderItemDetailsField>
              )}
            </Panel.Body>
          </Panel>
        </PanelGroup>
      </Col>
      <Col md={3}>
        <OrderItemDetailsSummary offering={props.offering} />
      </Col>
    </Row>
  );
};

OrderItemDetails = memo(OrderItemDetails);
export { OrderItemDetails };
