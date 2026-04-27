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
    | 'terminate';
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
    default:
      return { label: 'N/A', type: null, variant: 'default' };
  }
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
