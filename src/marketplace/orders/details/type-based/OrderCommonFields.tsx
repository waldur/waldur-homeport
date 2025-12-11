import { useMemo } from 'react';
import { OrderDetails, PublicOfferingDetails } from 'waldur-js-client';

import { formatDate } from '@waldur/core/dateUtils';
import { FieldWithCopy } from '@waldur/core/FieldWithCopy';
import { defaultCurrency } from '@waldur/core/formatCurrency';
import { translate } from '@waldur/i18n';
import { Field } from '@waldur/resource/summary';

import { getPlanUnitAbbr } from '../../utils';
import { OrderSummaryMessage } from '../OrderSummaryMessage';

export interface OrderTypeBasedProps {
  order: OrderDetails;
  offering?: PublicOfferingDetails;
}

export const RequestedByField = ({ order }: OrderTypeBasedProps) => (
  <Field
    label={translate('Requested by')}
    value={order.created_by_full_name + ` (${order.created_by_username})`}
  />
);

export const RequestCommentField = ({ order }: OrderTypeBasedProps) =>
  order.request_comment && (
    <Field
      label={translate('PO reference')}
      value={<FieldWithCopy value={order.request_comment} />}
    />
  );

export const DescriptionField = ({ order, offering }: OrderTypeBasedProps) => (
  <Field
    label={translate('Description')}
    value={<OrderSummaryMessage order={order} offering={offering} />}
  />
);

export const StartDateField = ({ order }: OrderTypeBasedProps) => (
  <Field label={translate('Start date')} value={formatDate(order.start_date)} />
);

export const CostChangeField = ({ order }: OrderTypeBasedProps) => {
  const costChange = useMemo(() => {
    const amount = defaultCurrency(
      Number(order.new_cost_estimate) - Number(order.old_cost_estimate),
      false,
      true,
    );
    return amount + getPlanUnitAbbr(order.plan_unit);
  }, [order]);
  return <Field label={translate('Cost change')} value={costChange} />;
};
