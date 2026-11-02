import { useMemo } from 'react';
import { OrderDetails, Offering } from 'waldur-js-client';

import { PropertyItem } from 'waldur-ui';

import { defaultCurrency } from '@/core/formatCurrency';
import { translate } from '@/i18n';
import { propVal } from '@/property/propertyFields';

import { getPlanUnitAbbr } from '../../utils';
import { OrderSummaryMessage } from '../OrderSummaryMessage';

/**
 * Every summary list in an order's details: the shared fields below render
 * inside one, so they read in the same columns as the rows around them.
 */
export const ORDER_LIST_PROPS = {
  variant: 'summary',
  termWidth: 'md',
  space: 2.5,
} as const;

export interface OrderTypeBasedProps {
  order: OrderDetails;
  offering?: Offering;
  editable?: boolean;
  shouldConcealPrices?: boolean;
}

export const RequestedByField = ({ order }: OrderTypeBasedProps) => (
  <PropertyItem
    label={translate('Requested by')}
    value={propVal.user({
      full_name: order.created_by_full_name,
      username: order.created_by_username,
    })}
  />
);

export const RequestCommentField = ({ order }: OrderTypeBasedProps) => {
  if (!order.request_comment) return null;
  return (
    <PropertyItem
      label={translate('PO reference')}
      value={order.request_comment}
      hideIfEmpty={false}
      hasCopy
    />
  );
};

export const DescriptionField = ({ order, offering }: OrderTypeBasedProps) => (
  <PropertyItem
    label={translate('Description')}
    value={<OrderSummaryMessage order={order} offering={offering} />}
  />
);

export const StartDateField = ({ order }: OrderTypeBasedProps) => (
  <PropertyItem
    label={translate('Start date')}
    value={propVal.date(order.start_date)}
  />
);

export const CostChangeField = ({
  order,
  shouldConcealPrices,
}: OrderTypeBasedProps) => {
  const costChange = useMemo(() => {
    if (order.new_plan_billing_mode === 'usage') {
      // A usage plan has no fee to compare against; the estimate would read
      // as a drop to zero.
      return order.old_plan_billing_mode === 'usage'
        ? translate('Billed by usage; rates change on the day of the switch')
        : translate('Billed by usage (previously {amount}{unit})', {
            amount: defaultCurrency(Number(order.old_cost_estimate) || 0),
            unit: getPlanUnitAbbr(order.plan_unit),
          });
    }
    const amount = defaultCurrency(
      Number(order.new_cost_estimate) - Number(order.old_cost_estimate),
      false,
      true,
    );
    return amount + getPlanUnitAbbr(order.plan_unit);
  }, [order]);
  if (shouldConcealPrices) return null;
  return <PropertyItem label={translate('Cost change')} value={costChange} />;
};
