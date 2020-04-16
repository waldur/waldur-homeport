import * as React from 'react';

import { ENV } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { OrderItemDetailsField } from '@waldur/marketplace/orders/item/details/OrderItemDetailsField';
import { SecretValueField } from '@waldur/marketplace/SecretValueField';
import { OrderItemDetailsProps } from '@waldur/marketplace/types';
import { BooleanField } from '@waldur/table-react/BooleanField';

export const OpenStackPackageDetails = ({
  orderItem: { attributes },
}: OrderItemDetailsProps) => (
  <>
    {ENV.plugins.WALDUR_OPENSTACK.TENANT_CREDENTIALS_VISIBLE && (
      <>
        <OrderItemDetailsField label={translate('Initial admin username')}>
          {attributes.user_username || translate('Auto-generated')}
        </OrderItemDetailsField>
        <OrderItemDetailsField label={translate('Initial admin password')}>
          {attributes.user_password ? (
            <SecretValueField
              className="max-w-300"
              value={attributes.user_password}
            />
          ) : (
            translate('Auto-generated')
          )}
        </OrderItemDetailsField>
      </>
    )}
    {attributes.subnet_cidr && (
      <OrderItemDetailsField label={translate('Internal network mask (CIDR)')}>
        {attributes.subnet_cidr}
      </OrderItemDetailsField>
    )}
    <OrderItemDetailsField
      label={translate('Skip connection to external network')}
    >
      <BooleanField value={attributes.skip_connection_extnet} />
    </OrderItemDetailsField>
  </>
);
