import * as moment from 'moment-timezone';
import * as React from 'react';

import { defaultCurrency } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { OrderItemDetailsType } from '@waldur/marketplace/orders/types';

interface OrderItemSummaryProps {
  orderItem: OrderItemDetailsType;
}

interface Context {
  orderItem: OrderItemDetailsType;
  user: string;
  approved: string;
}

const getCreateSummary = (ctx: Context): string => {
  const msg = translate('{user} has requested provisioning of "{resource_name}" with plan "{plan_name}".', {
    user: ctx.user,
    resource_name: ctx.orderItem.attributes.name,
    resource_type: ctx.orderItem.resource_type,
    plan_name: ctx.orderItem.new_plan_name || 'Default',
  });
  if (ctx.approved) {
    return msg + ' ' + ctx.approved;
  } else {
    return msg;
  }
};

const getUpdateSummary = (ctx: Context) => {
  const msg = translate('{user} has requested changing of plan from "{old_plan}" to "{new_plan}".', {
    user: ctx.user,
    old_plan: ctx.orderItem.old_plan_name || 'Default',
    new_plan: ctx.orderItem.new_plan_name,
  });
  if (ctx.approved) {
    return msg + ' ' + ctx.approved;
  } else {
    return msg + ' ' + translate('Estimated monthly fee will change from {old_estimate} to {new_estimate}. VAT is not included.', {
      old_estimate: defaultCurrency(ctx.orderItem.old_cost_estimate || 0),
      new_estimate: defaultCurrency(ctx.orderItem.new_cost_estimate || 0),
    });
  }
};

const getTerminateSummary = (ctx: Context) => {
  const msg = translate('{user} has requested termination of {resource_name} with active plan "{plan_name}".', {
    user: ctx.user,
    resource_name: ctx.orderItem.resource_name,
    resource_type: ctx.orderItem.resource_type,
    plan_name: ctx.orderItem.old_plan_name || 'Default',
  });
  if (ctx.approved) {
    return msg + ' ' + ctx.approved;
  } else {
    return msg;
  }
};

const getContext = (orderItem: OrderItemDetailsType): Context => {
  let user = orderItem.created_by_full_name;
  if (orderItem.created_by_civil_number) {
    user += ` (ID: ${orderItem.created_by_civil_number})`;
  }
  let approved;
  if (orderItem.order_approved_at && orderItem.order_approved_by) {
    approved = translate('{user} has approved it on {date} at {time}.', {
      user: orderItem.order_approved_by,
      date: moment(orderItem.order_approved_at).format('YYYY-MM-DD'),
      time: moment(orderItem.order_approved_at).format('HH:mm'),
    });
  }
  return {user, approved, orderItem};
};

const getMessage = (orderItem: OrderItemDetailsType): string => {
  const ctx = getContext(orderItem);
  if (orderItem.type === 'Create') {
    return getCreateSummary(ctx);
  } else if (orderItem.type === 'Update') {
    return getUpdateSummary(ctx);
  } else if (orderItem.type === 'Terminate') {
    return getTerminateSummary(ctx);
  }
};

export const OrderItemSummary: React.SFC<OrderItemSummaryProps> = props => (
  <span>{getMessage(props.orderItem)}</span>
);
