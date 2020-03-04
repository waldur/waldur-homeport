import * as React from 'react';

import { StateIndicator } from '@waldur/core/StateIndicator';
import { translate } from '@waldur/i18n';
import { OrderItemDetailsType } from '@waldur/marketplace/orders/types';

export const OrderItemTypeIndicator = ({
  orderItem,
}: {
  orderItem: OrderItemDetailsType;
}) => {
  const label = React.useMemo(() => {
    switch (orderItem.type) {
      case 'Create':
        return translate('Provision new resource').toLocaleUpperCase();
      case 'Update':
        if (orderItem.attributes.old_limits) {
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
  }, [orderItem]);

  const variant = React.useMemo(
    () =>
      orderItem.type === 'Create'
        ? 'primary'
        : orderItem.type === 'Update'
        ? 'success'
        : orderItem.type === 'Terminate'
        ? 'warning'
        : 'plain',
    [orderItem],
  );

  return <StateIndicator label={label} variant={variant} />;
};
