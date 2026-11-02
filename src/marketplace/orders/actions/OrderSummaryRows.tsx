import { FC } from 'react';
import { OrderDetails } from 'waldur-js-client';

import { PropertyItem, PropertyList } from 'waldur-ui';

import { translate } from '@/i18n';

import { ResourceNameField } from '../list/ResourceNameField';
import { getOrderType } from '../utils';

/**
 * Identifies the order a provider is about to approve or reject, so that a
 * mis-clicked row is caught before the action is confirmed.
 */
export const OrderSummaryRows: FC<{ order: OrderDetails }> = ({ order }) => {
  return (
    <PropertyList hideActions detailsMode>
      <PropertyItem
        label={translate('Resource')}
        value={<ResourceNameField row={order} />}
      />
      <PropertyItem label={translate('Project')} value={order.project_name} />
      <PropertyItem
        label={translate('Client organization')}
        value={order.customer_name}
      />
      <PropertyItem label={translate('Offering')} value={order.offering_name} />
      <PropertyItem
        label={translate('Type')}
        value={getOrderType(order).label}
      />
    </PropertyList>
  );
};
