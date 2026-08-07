import { BillingUnit, OrderDetails } from 'waldur-js-client';

import { translate } from '@/i18n';

interface OrderType {
  label: string;
  type:
    | 'create'
    | 'renew'
    | 'limits_update'
    | 'options_update'
    | 'switch_plan'
    | 'terminate'
    | 'restore';
  variant: string;
}

export const getOrderType = (order: OrderDetails): OrderType => {
  const attributes = order.attributes as Record<string, any>;
  switch (order.type) {
    case 'Create':
      return {
        label: translate('Provision new resource'),
        type: 'create',
        variant: 'success',
      };
    case 'Update':
      // Match the processor logic for determining update type
      if (attributes.action === 'renew') {
        return {
          label: translate('Renew prepaid resource'),
          type: 'renew',
          variant: 'default',
        };
      } else if (attributes.old_limits) {
        return {
          label: translate('Update resource limits'),
          type: 'limits_update',
          variant: 'purple',
        };
      } else if (attributes.new_options) {
        return {
          label: translate('Update resource options'),
          type: 'options_update',
          variant: 'blue',
        };
      } else {
        return {
          label: translate('Switch resource plan'),
          type: 'switch_plan',
          variant: 'success',
        };
      }
    case 'Terminate':
      return {
        label: translate('Terminate an existing resource'),
        type: 'terminate',
        variant: 'danger',
      };
    case 'Restore':
      return {
        label: translate('Restore a terminated resource'),
        type: 'restore',
        variant: 'success',
      };
    default:
      return { label: 'N/A', type: null, variant: 'default' };
  }
};

interface MessagingOrder {
  consumer_message?: string | null;
  consumer_message_attachment?: string | null;
  provider_message_updated_at?: string | null;
  consumer_message_updated_at?: string | null;
}

export const hasFreshConsumerResponse = (order: MessagingOrder): boolean => {
  if (!order.consumer_message && !order.consumer_message_attachment) {
    return false;
  }
  const providerTs = order.provider_message_updated_at;
  const consumerTs = order.consumer_message_updated_at;
  if (providerTs && consumerTs) {
    return consumerTs >= providerTs;
  }
  // Orders predating the timestamps: a provider-side timestamp alone means the
  // provider wrote after the consumer's untimestamped response.
  return !providerTs;
};

export const getPlanUnitAbbr = (planUnit: BillingUnit) =>
  planUnit === 'hour'
    ? translate('/hr')
    : planUnit === 'day'
      ? translate('/day')
      : planUnit === 'half_month'
        ? translate('/half month')
        : planUnit === 'month'
          ? translate('/mo')
          : planUnit === 'quarter'
            ? translate('/quarter')
            : '/' + planUnit;
