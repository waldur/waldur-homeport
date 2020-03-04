import * as React from 'react';

import { translate } from '@waldur/i18n';
import { OrderItemDetailsField } from '@waldur/marketplace/orders/item/details/OrderItemDetailsField';
import { SecretValueField } from '@waldur/marketplace/SecretValueField';
import { OrderItemDetailsProps } from '@waldur/marketplace/types';

export const AzureVirtualMachineDetails = (props: OrderItemDetailsProps) => {
  const { attributes } = props.orderItem;
  return (
    <>
      <OrderItemDetailsField label={translate('Admin username')}>
        {attributes.username}
      </OrderItemDetailsField>
      <OrderItemDetailsField label={translate('Admin password')}>
        <SecretValueField className="max-w-300" value={attributes.password} />
      </OrderItemDetailsField>
    </>
  );
};
