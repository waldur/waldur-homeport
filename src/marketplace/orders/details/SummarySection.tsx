import { Accordion } from 'react-bootstrap';

import { formatDate } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { ResourceReference } from '@waldur/marketplace/resources/types';
import { OrderDetailsProps } from '@waldur/marketplace/types';

import { DetailsField } from '../../common/DetailsField';
import { OrderConsumerActions } from '../actions/OrderConsumerActions';
import { OrderStateCell } from '../list/OrderStateCell';

import { CancelOrderButton } from './CancelOrderButton';
import { OrderResourceLink } from './OrderResourceLink';
import { OrderSummaryMessage } from './OrderSummaryMessage';
import { OrderTypeIndicator } from './OrderTypeIndicator';

export const SummarySection = ({
  order,
  offering,
  loadData,
}: OrderDetailsProps & { loadData(): void }) => (
  <Accordion.Item eventKey="summary">
    <Accordion.Header>{translate('Summary')}</Accordion.Header>
    <Accordion.Body>
      <DetailsField label={translate('Project name')}>
        {order.project_name}
      </DetailsField>
      {order.project_description && (
        <DetailsField label={translate('Project description')}>
          {order.project_description}
        </DetailsField>
      )}
      <DetailsField label={translate('Description')}>
        <OrderSummaryMessage order={order} offering={offering} />
      </DetailsField>
      <DetailsField label={translate('Type')}>
        <OrderTypeIndicator order={order} />
      </DetailsField>
      <DetailsField label={translate('State')}>
        <OrderStateCell row={order} />
      </DetailsField>
      {order.error_message && (
        <DetailsField label={translate('Error message')}>
          {order.error_message}
        </DetailsField>
      )}
      {order.error_traceback && (
        <DetailsField label={translate('Error traceback')}>
          {order.error_traceback}
        </DetailsField>
      )}
      {order.marketplace_resource_uuid && (
        <DetailsField label={translate('Resource')}>
          <OrderResourceLink item={order as ResourceReference}>
            {translate('Resource link')}
          </OrderResourceLink>
        </DetailsField>
      )}
      <DetailsField label={translate('Actions')}>
        {order.can_terminate && (
          <CancelOrderButton uuid={order.uuid} loadData={loadData} />
        )}
        {order.state === 'pending' && (
          <OrderConsumerActions
            orderId={order.uuid}
            customerId={order.customer_uuid}
            projectId={order.project_uuid}
          />
        )}
      </DetailsField>
      {order.provider_reviewed_by && (
        <DetailsField label={translate('Reviewed by')}>
          {order.provider_reviewed_by_full_name || order.provider_reviewed_by}
        </DetailsField>
      )}
      {order.provider_reviewed_at && (
        <DetailsField label={translate('Reviewed at')}>
          {formatDate(order.provider_reviewed_at)}
        </DetailsField>
      )}
    </Accordion.Body>
  </Accordion.Item>
);
