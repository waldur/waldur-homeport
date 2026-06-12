import { useMemo } from 'react';
import { OrderDetails, Offering } from 'waldur-js-client';

import { formatDate } from '@/core/dateUtils';
import { FieldWithCopy } from '@/core/FieldWithCopy';
import { defaultCurrency } from '@/core/formatCurrency';
import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import { Field } from '@/resource/summary';

import { getPlanUnitAbbr } from '../../utils';
import { OrderSummaryMessage } from '../OrderSummaryMessage';

export interface OrderTypeBasedProps {
  order: OrderDetails;
  offering?: Offering;
  editable?: boolean;
  formTableItem?: boolean;
  shouldConcealPrices?: boolean;
}

export const RequestedByField = ({
  order,
  formTableItem,
}: OrderTypeBasedProps) => {
  const value = order.created_by_full_name + ` (${order.created_by_username})`;
  if (formTableItem) {
    return <FormTable.Item label={translate('Requested by')} value={value} />;
  }
  return (
    <Field label={translate('Requested by')} labelWidth={200} value={value} />
  );
};

export const RequestCommentField = ({
  order,
  formTableItem,
}: OrderTypeBasedProps) => {
  if (!order.request_comment) return null;
  const value = <FieldWithCopy value={order.request_comment} />;
  if (formTableItem) {
    return <FormTable.Item label={translate('PO reference')} value={value} />;
  }
  return (
    <Field label={translate('PO reference')} labelWidth={200} value={value} />
  );
};

export const DescriptionField = ({
  order,
  offering,
  formTableItem,
}: OrderTypeBasedProps) => {
  const value = <OrderSummaryMessage order={order} offering={offering} />;
  if (formTableItem) {
    return <FormTable.Item label={translate('Description')} value={value} />;
  }
  return (
    <Field label={translate('Description')} labelWidth={200} value={value} />
  );
};

export const StartDateField = ({
  order,
  formTableItem,
}: OrderTypeBasedProps) => {
  const value = formatDate(order.start_date);
  if (formTableItem) {
    return <FormTable.Item label={translate('Start date')} value={value} />;
  }
  return (
    <Field label={translate('Start date')} labelWidth={200} value={value} />
  );
};

export const CostChangeField = ({
  order,
  formTableItem,
  shouldConcealPrices,
}: OrderTypeBasedProps) => {
  const costChange = useMemo(() => {
    const amount = defaultCurrency(
      Number(order.new_cost_estimate) - Number(order.old_cost_estimate),
      false,
      true,
    );
    return amount + getPlanUnitAbbr(order.plan_unit);
  }, [order]);
  if (shouldConcealPrices) return null;
  if (formTableItem) {
    return (
      <FormTable.Item label={translate('Cost change')} value={costChange} />
    );
  }
  return (
    <Field
      label={translate('Cost change')}
      labelWidth={200}
      value={costChange}
    />
  );
};
