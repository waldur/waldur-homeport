import * as React from 'react';

import { StateIndicator } from '@waldur/core/StateIndicator';
import { translate } from '@waldur/i18n';
import { OrderItemType } from '@waldur/marketplace/orders/types';

export const OrderItemTypeIndicator = ({ orderItemType }: {orderItemType: OrderItemType}) => (
  <StateIndicator
    label={
      orderItemType === 'Create' ? translate('Provision new resource').toLocaleUpperCase() :
      orderItemType === 'Update' ? translate('Switch plan for an existing resource').toLocaleUpperCase() :
      orderItemType === 'Terminate' ? translate('Terminate an existing resource').toLocaleUpperCase() : 'N/A'
    }
    variant={
      orderItemType === 'Create' ? 'primary' :
      orderItemType === 'Update' ? 'success' :
      orderItemType === 'Terminate' ? 'warning' : 'plain'
    }
  />
);
