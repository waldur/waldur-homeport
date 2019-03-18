import * as React from 'react';

import { defaultCurrency } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { OrderItemDetailsType } from '@waldur/marketplace/orders/types';

interface OrderItemSummaryProps {
  orderItem: OrderItemDetailsType;
}

const getMessage = (orderItem: OrderItemDetailsType) => {
  let user = orderItem.created_by_full_name;
  if (orderItem.created_by_civil_number) {
    user += ` (ID: ${orderItem.created_by_civil_number})`;
  }
  if (orderItem.type === 'Create') {
    const ctx = {
      user,
      resource_name: orderItem.attributes.name,
      resource_type: orderItem.resource_type,
      plan_name: orderItem.old_plan_name || 'Default',
    };
    return translate('User {user} has requested resource provisioning {resource_name} ({resource_type}) with plan: {plan_name}.', ctx);
  } else if (orderItem.type === 'Update') {
    const ctx = {
      user,
      old_plan: orderItem.old_plan_name,
      new_plan: orderItem.new_plan_name,
      old_estimate: defaultCurrency(orderItem.old_cost_estimate),
      new_estimate: defaultCurrency(orderItem.new_cost_estimate),
    };
    return translate('User {user} has requested change of plan. Old plan: {old_plan}, new plan: {new_plan}.', ctx) + ' ' +
      translate('Estimated monthly fee will change from {old_estimate} to {new_estimate}. VAT is not included.', ctx);
  } else if (orderItem.type === 'Terminate') {
    const ctx = {
      user,
      resource_name: orderItem.resource_name,
      resource_type: orderItem.resource_type,
      plan_name: orderItem.old_plan_name || 'Default',
    };
    return translate('User {user} has requested termination of {resource_name} ({resource_type}) with plan: {plan_name}.', ctx);
  }
};

export const OrderItemSummary: React.SFC<OrderItemSummaryProps> = props => (
  <div className="bs-callout bs-callout-success">
    {getMessage(props.orderItem)}
  </div>
);
