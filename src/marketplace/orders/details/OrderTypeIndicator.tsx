import { useMemo } from 'react';

import { StateIndicator } from '@waldur/core/StateIndicator';
import { translate } from '@waldur/i18n';
import { OrderDetailsType } from '@waldur/marketplace/orders/types';

export const OrderTypeIndicator = ({ order }: { order: OrderDetailsType }) => {
  const label = useMemo(() => {
    switch (order.type) {
      case 'Create':
        return translate('Provision new resource').toLocaleUpperCase();
      case 'Update':
        if (order.attributes.old_limits) {
          return translate(
            'Update limits for an existing resource',
          ).toLocaleUpperCase();
        } else {
          return translate(
            'Update plan for an existing resource',
          ).toLocaleUpperCase();
        }
      case 'Terminate':
        return translate('Terminate an existing resource').toLocaleUpperCase();
      default:
        return 'N/A';
    }
  }, [order]);

  const variant = useMemo(
    () =>
      order.type === 'Create'
        ? 'primary'
        : order.type === 'Update'
        ? 'success'
        : order.type === 'Terminate'
        ? 'warning'
        : 'plain',
    [order],
  );

  return <StateIndicator label={label} variant={variant} />;
};
