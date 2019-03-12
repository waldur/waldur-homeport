import * as React from 'react';

import { StateIndicator } from '@waldur/core/StateIndicator';
import { translate } from '@waldur/i18n';

export const OrderItemTypeIndicator = ({ orderItemType }) => (
  <StateIndicator
    label={
      orderItemType === 'Create' ? translate('Provision new resource').toLocaleUpperCase() :
      orderItemType === 'Update' ? translate('Switch plan for an existing resource').toLocaleUpperCase() :
      orderItemType === 'Delete' ? translate('Terminate an existing resource').toLocaleUpperCase() : 'N/A'
    }
    variant={
      orderItemType === 'Create' ? 'primary' :
      orderItemType === 'Update' ? 'success' :
      orderItemType === 'Delete' ? 'warning' : 'plain'
    }
  />
);
