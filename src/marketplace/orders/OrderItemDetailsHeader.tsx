import * as React from 'react';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { OrderItemDetailsSection } from '@waldur/marketplace/orders/OrderItemDetailsSection';

import { renderOfferingComponents } from '../offerings/utils';
import { OrderItemDetailsProps } from '../types';
import { OrderItemDetailsField } from './OrderItemDetailsField';

export const OrderItemDetailsHeader = (props: OrderItemDetailsProps) => (
  <>
    <OrderItemDetailsField>
      <OrderItemDetailsSection>
        {translate('Attributes')}
      </OrderItemDetailsSection>
    </OrderItemDetailsField>
    {props.orderItem.marketplace_resource_uuid && (
      <OrderItemDetailsField label={translate('Resource UUID')}>
        {props.orderItem.marketplace_resource_uuid}
      </OrderItemDetailsField>
    )}
    <OrderItemDetailsField label={translate('Created at')}>
      {formatDateTime(props.orderItem.created)}
    </OrderItemDetailsField>
    <OrderItemDetailsField label={translate('Components')}>
      {renderOfferingComponents(props.offering)}
    </OrderItemDetailsField>
    <OrderItemDetailsField label={translate('Name')}>
      {props.orderItem.attributes.name}
    </OrderItemDetailsField>
    {props.orderItem.attributes.description && (
      <OrderItemDetailsField label={translate('Description')}>
        {props.orderItem.attributes.description}
      </OrderItemDetailsField>
    )}
  </>
);
