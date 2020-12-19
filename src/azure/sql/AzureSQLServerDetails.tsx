import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { OrderItemDetailsField } from '@waldur/marketplace/orders/item/details/OrderItemDetailsField';
import { SecretValueField } from '@waldur/marketplace/SecretValueField';
import { OrderItemDetailsProps } from '@waldur/marketplace/types';

export const AzureSQLServerDetails: FunctionComponent<OrderItemDetailsProps> = (
  props,
) => {
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
