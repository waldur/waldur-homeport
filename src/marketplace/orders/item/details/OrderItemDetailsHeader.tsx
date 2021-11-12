import { FunctionComponent } from 'react';

import { formatDateTime } from '@waldur/core/dateUtils';
import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { OrderItemDetailsProps } from '@waldur/marketplace/types';

import { OrderItemDetailsField } from './OrderItemDetailsField';

export const OrderItemDetailsHeader: FunctionComponent<OrderItemDetailsProps> =
  (props) => (
    <>
      {props.orderItem.marketplace_resource_uuid && (
        <OrderItemDetailsField label={translate('Resource UUID')}>
          {props.orderItem.marketplace_resource_uuid}
        </OrderItemDetailsField>
      )}
      <OrderItemDetailsField label={translate('Created at')}>
        {formatDateTime(props.orderItem.created)}
      </OrderItemDetailsField>
      {props.offering.components.length > 0 && (
        <OrderItemDetailsField label={translate('Components')}>
          {props.offering.components
            .map((component) => component.type)
            .join(', ')}
        </OrderItemDetailsField>
      )}
      {props.orderItem.attributes.name && (
        <OrderItemDetailsField label={translate('Resource name')}>
          {props.orderItem.attributes.name}
        </OrderItemDetailsField>
      )}
      {props.orderItem.attributes.description && (
        <OrderItemDetailsField label={translate('Resource description')}>
          {props.orderItem.attributes.description}
        </OrderItemDetailsField>
      )}
      {props.orderItem.issue && (
        <OrderItemDetailsField label={translate('Issue')}>
          <Link
            state="support.detail"
            params={{ uuid: props.orderItem.issue.uuid }}
            label={props.orderItem.issue.key || 'N/A'}
          />
        </OrderItemDetailsField>
      )}
    </>
  );
