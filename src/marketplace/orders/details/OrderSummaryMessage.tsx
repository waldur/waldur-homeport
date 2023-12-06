import { DateTime } from 'luxon';
import { FunctionComponent, useMemo } from 'react';

import { defaultCurrency } from '@waldur/core/formatCurrency';
import { translate } from '@waldur/i18n';
import { OrderDetailsType } from '@waldur/marketplace/orders/types';
import { Offering, OfferingComponent } from '@waldur/marketplace/types';

interface OrderSummaryProps {
  order: OrderDetailsType;
  offering: Offering;
}

type ComponentMap = Record<string, OfferingComponent>;

type Limits = Record<string, number>;

interface Context {
  order: Pick<
    OrderDetailsType,
    | 'attributes'
    | 'limits'
    | 'resource_name'
    | 'old_plan_name'
    | 'new_plan_name'
    | 'old_cost_estimate'
    | 'new_cost_estimate'
  >;
  user: string;
  approved?: string;
  components: OfferingComponent[];
}

const getCreateSummary = (ctx: Context): string => {
  const msg = translate(
    '{user} has requested provisioning of "{resource_name}" with plan "{plan_name}".',
    {
      user: ctx.user,
      resource_name: ctx.order.attributes.name,
      plan_name: ctx.order.new_plan_name || 'Default',
    },
  );
  if (ctx.approved) {
    return msg + ' ' + ctx.approved;
  } else {
    return msg;
  }
};

const formatComponent = (
  limits: Limits,
  componentMap: ComponentMap,
  key: string,
) =>
  [
    `${key.toLocaleUpperCase()}:`,
    limits[key] / (componentMap[key]?.factor || 1),
    componentMap[key]?.measured_unit,
  ]
    .filter((x) => x)
    .join(' ');

const formatLimits = (limits: Limits, componentMap: ComponentMap) =>
  Object.keys(limits)
    .sort()
    .map((key) => formatComponent(limits, componentMap, key))
    .join(', ');

const getComponentMap = (components: OfferingComponent[]): ComponentMap =>
  components.reduce((r, c) => ({ ...r, [c.type]: c }), {});

export const getUpdateSummary = (ctx: Context) => {
  let msg;
  const componentMap = getComponentMap(ctx.components);
  if (ctx.order.attributes.old_limits) {
    msg = translate(
      '{user} has requested changing of limits from "{old_limits}" to "{new_limits}".',
      {
        user: ctx.user,
        old_limits: formatLimits(ctx.order.attributes.old_limits, componentMap),
        new_limits: formatLimits(ctx.order.limits, componentMap),
      },
    );
  } else {
    msg = translate(
      '{user} has requested changing of plan from "{old_plan}" to "{new_plan}".',
      {
        user: ctx.user,
        old_plan: ctx.order.old_plan_name || 'Default',
        new_plan: ctx.order.new_plan_name,
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
          old_estimate: defaultCurrency(ctx.order.old_cost_estimate || 0),
          new_estimate: defaultCurrency(ctx.order.new_cost_estimate || 0),
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
      resource_name: ctx.order.resource_name,
      plan_name: ctx.order.old_plan_name || 'Default',
    },
  );
  if (ctx.approved) {
    return msg + ' ' + ctx.approved;
  } else {
    return msg;
  }
};

const getContext = (order: OrderDetailsType, offering: Offering): Context => {
  let user = order.created_by_full_name;
  if (order.created_by_civil_number) {
    user += ` (ID: ${order.created_by_civil_number})`;
  }
  let approved;
  if (order.consumer_reviewed_at && order.consumer_reviewed_by) {
    approved = translate('{user} has approved it on {date} at {time}.', {
      user: order.consumer_reviewed_by,
      date: DateTime.fromISO(order.consumer_reviewed_at).toISODate(),
      time: DateTime.fromISO(order.consumer_reviewed_at).toFormat('HH:mm'),
    });
  }
  return { user, approved, order, components: offering.components };
};

const getMessage = (order: OrderDetailsType, offering: Offering): string => {
  const ctx = getContext(order, offering);
  if (order.type === 'Create') {
    return getCreateSummary(ctx);
  } else if (order.type === 'Update') {
    return getUpdateSummary(ctx);
  } else if (order.type === 'Terminate') {
    return getTerminateSummary(ctx);
  }
};

export const OrderSummaryMessage: FunctionComponent<OrderSummaryProps> = (
  props,
) => {
  const message = useMemo(
    () => getMessage(props.order, props.offering),
    [props.order, props.offering],
  );
  return <>{message}</>;
};
