import * as moment from 'moment-timezone';
import * as React from 'react';

import { defaultCurrency } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { OrderItemDetailsType } from '@waldur/marketplace/orders/types';
import { Offering } from '@waldur/marketplace/types';

interface OrderItemSummaryProps {
  orderItem: OrderItemDetailsType;
  offering: Offering;
}

interface Context {
  orderItem: OrderItemDetailsType;
  user: string;
  approved: string;
  offering: Offering;
}

const getCreateSummary = (ctx: Context): string => {
  const msg = translate(
    '{user} has requested provisioning of "{resource_name}" with plan "{plan_name}".',
    {
      user: ctx.user,
      resource_name: ctx.orderItem.attributes.name,
      resource_type: ctx.orderItem.resource_type,
      plan_name: ctx.orderItem.new_plan_name || 'Default',
    },
  );
  if (ctx.approved) {
    return msg + ' ' + ctx.approved;
  } else {
    return msg;
  }
};

const formatLimits = (limits, componentMap) =>
  Object.keys(limits)
    .sort()
    .map(
      key =>
        `${key.toLocaleUpperCase()}: ${limits[key] /
          componentMap[key].factor} ${componentMap[key].measured_unit}`,
    )
    .join(', ');

const getComponentMap = components =>
  components.reduce((r, c) => ({ ...r, [c.type]: c || 1 }), {});

const getUpdateSummary = (ctx: Context) => {
  let msg;
  const componentMap = getComponentMap(ctx.offering.components);
  if (ctx.orderItem.attributes.old_limits) {
    msg = translate(
      '{user} has requested changing of limits from "{old_limits}" to "{new_limits}".',
      {
        user: ctx.user,
        old_limits: formatLimits(
          ctx.orderItem.attributes.old_limits,
          componentMap,
        ),
        new_limits: formatLimits(ctx.orderItem.limits, componentMap),
      },
    );
  } else {
    msg = translate(
      '{user} has requested changing of plan from "{old_plan}" to "{new_plan}".',
      {
        user: ctx.user,
        old_plan: ctx.orderItem.old_plan_name || 'Default',
        new_plan: ctx.orderItem.new_plan_name,
      },
    );
  }
  if (ctx.approved) {
    return msg + ' ' + ctx.approved;
  } else {
    return (
      msg +
      ' ' +
      translate(
        'Estimated monthly fee will change from {old_estimate} to {new_estimate}. VAT is not included.',
        {
          old_estimate: defaultCurrency(ctx.orderItem.old_cost_estimate || 0),
          new_estimate: defaultCurrency(ctx.orderItem.new_cost_estimate || 0),
        },
      )
    );
  }
};

const getTerminateSummary = (ctx: Context) => {
  const msg = translate(
    '{user} has requested termination of {resource_name} with active plan "{plan_name}".',
    {
      user: ctx.user,
      resource_name: ctx.orderItem.resource_name,
      resource_type: ctx.orderItem.resource_type,
      plan_name: ctx.orderItem.old_plan_name || 'Default',
    },
  );
  if (ctx.approved) {
    return msg + ' ' + ctx.approved;
  } else {
    return msg;
  }
};

const getContext = (
  orderItem: OrderItemDetailsType,
  offering: Offering,
): Context => {
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
  return { user, approved, orderItem, offering };
};

const getMessage = (
  orderItem: OrderItemDetailsType,
  offering: Offering,
): string => {
  const ctx = getContext(orderItem, offering);
  if (orderItem.type === 'Create') {
    return getCreateSummary(ctx);
  } else if (orderItem.type === 'Update') {
    return getUpdateSummary(ctx);
  } else if (orderItem.type === 'Terminate') {
    return getTerminateSummary(ctx);
  }
};

export const OrderItemSummary: React.FC<OrderItemSummaryProps> = props => {
  const message = React.useMemo(
    () => getMessage(props.orderItem, props.offering),
    [props.orderItem, props.offering],
  );
  return <>{message}</>;
};
