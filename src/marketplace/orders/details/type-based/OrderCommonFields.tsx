import { useMemo } from 'react';
import { OrderDetails, PublicOfferingDetails } from 'waldur-js-client';

import { formatDate } from '@waldur/core/dateUtils';
import { FieldWithCopy } from '@waldur/core/FieldWithCopy';
import { defaultCurrency } from '@waldur/core/formatCurrency';
import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import { Field } from '@waldur/resource/summary';

import { getPlanUnitAbbr } from '../../utils';
import { OrderSummaryMessage } from '../OrderSummaryMessage';

export interface OrderTypeBasedProps {
  order: OrderDetails;
  offering?: PublicOfferingDetails;
  editable?: boolean;
  formTableItem?: boolean;
  shouldConcealPrices?: boolean;
}

export const RequestedByField = ({
  order,
  formTableItem,
}: OrderTypeBasedProps) => {
  const Component = formTableItem ? FormTable.Item : Field;
  return (
    <Component
      label={translate('Requested by')}
      labelCol={1}
      value={order.created_by_full_name + ` (${order.created_by_username})`}
    />
  );
};

export const RequestCommentField = ({
  order,
  formTableItem,
}: OrderTypeBasedProps) => {
  const Component = formTableItem ? FormTable.Item : Field;
  return (
    order.request_comment && (
      <Component
        label={translate('PO reference')}
        labelCol={1}
        value={<FieldWithCopy value={order.request_comment} />}
      />
    )
  );
};

export const DescriptionField = ({
  order,
  offering,
  formTableItem,
}: OrderTypeBasedProps) => {
  const Component = formTableItem ? FormTable.Item : Field;
  return (
    <Component
      label={translate('Description')}
      labelCol={1}
      value={<OrderSummaryMessage order={order} offering={offering} />}
    />
  );
};

export const StartDateField = ({
  order,
  formTableItem,
}: OrderTypeBasedProps) => {
  const Component = formTableItem ? FormTable.Item : Field;
  return (
    <Component
      label={translate('Start date')}
      labelCol={1}
      value={formatDate(order.start_date)}
    />
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
  const Component = formTableItem ? FormTable.Item : Field;
  return (
    <Component
      label={translate('Cost change')}
      labelCol={1}
      value={costChange}
    />
  );
};
