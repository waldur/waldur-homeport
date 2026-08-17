import { FC } from 'react';
import { OrderDetails } from 'waldur-js-client';

import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import { renderFieldOrDash } from '@/table/utils';

import { ResourceNameField } from '../list/ResourceNameField';
import { getOrderType } from '../utils';

/**
 * Identifies the order a provider is about to approve or reject, so that a
 * mis-clicked row is caught before the action is confirmed.
 */
export const OrderSummaryRows: FC<{ order: OrderDetails }> = ({ order }) => {
  return (
    <FormTable detailsMode>
      <FormTable.Item
        label={translate('Resource')}
        value={<ResourceNameField row={order} />}
      />
      <FormTable.Item
        label={translate('Project')}
        value={renderFieldOrDash(order.project_name)}
      />
      <FormTable.Item
        label={translate('Client organization')}
        value={renderFieldOrDash(order.customer_name)}
      />
      <FormTable.Item
        label={translate('Offering')}
        value={renderFieldOrDash(order.offering_name)}
      />
      <FormTable.Item
        label={translate('Type')}
        value={getOrderType(order).label}
      />
    </FormTable>
  );
};
