import { isEmpty } from 'lodash';
import { memo } from 'react';
import { Accordion, Col, Row } from 'react-bootstrap';

import { formatDate } from '@waldur/core/dateUtils';
import { titleCase } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import {
  getDetailsComponent,
  getFormLimitParser,
} from '@waldur/marketplace/common/registry';
import { PlanDetails } from '@waldur/marketplace/details/plan/PlanDetails';
import { OrderItemLimits } from '@waldur/marketplace/orders/item/details/OrderItemLimits';
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
  const limitParser = getFormLimitParser(props.orderItem.offering_type);
  const limits = limitParser(props.orderItem.limits);
  return (
    <Row>
      <Col md={9}>
        <Accordion id="order-item-details" defaultActiveKey="summary">
          <Accordion.Item eventKey="summary">
            <Accordion.Header>{translate('Summary')}</Accordion.Header>
            <Accordion.Body>
              <OrderItemDetailsField label={translate('Project name')}>
                {props.orderItem.project_name}
              </OrderItemDetailsField>
              {props.orderItem.project_description && (
                <OrderItemDetailsField label={translate('Project description')}>
                  {props.orderItem.project_description}
                </OrderItemDetailsField>
              )}
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
                  {props.orderItem.reviewed_by_full_name ||
                    props.orderItem.reviewed_by}
                </OrderItemDetailsField>
              )}
              {props.orderItem.reviewed_at && (
                <OrderItemDetailsField label={translate('Reviewed at')}>
                  {formatDate(props.orderItem.reviewed_at)}
                </OrderItemDetailsField>
              )}
            </Accordion.Body>
          </Accordion.Item>
          {props.orderItem.plan && (
            <Accordion.Item eventKey="plan">
              <Accordion.Header>
                {props.orderItem.type === 'Create'
                  ? translate('New plan')
                  : translate('Plan')}
              </Accordion.Header>
              <Accordion.Body>
                <PlanDetails
                  orderItem={props.orderItem}
                  offering={props.offering}
                  limits={props.limits}
                />
              </Accordion.Body>
            </Accordion.Item>
          )}
          {props.offering.components.length > 0 && !isEmpty(limits) && (
            <Accordion.Item eventKey="limits">
              <Accordion.Header>{translate('Limits')}</Accordion.Header>
              <Accordion.Body>
                <OrderItemLimits
                  components={props.offering.components}
                  limits={limits}
                />
              </Accordion.Body>
            </Accordion.Item>
          )}
          <Accordion.Item eventKey="details">
            <Accordion.Header>{translate('Details')}</Accordion.Header>
            <Accordion.Body>
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
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      </Col>
      <Col md={3}>
        <OrderItemDetailsSummary offering={props.offering} />
      </Col>
    </Row>
  );
};

OrderItemDetails = memo(OrderItemDetails);
export { OrderItemDetails };
