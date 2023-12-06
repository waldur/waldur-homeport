import { FunctionComponent } from 'react';

import { ENV } from '@waldur/configs/default';
import { translate } from '@waldur/i18n';
import { DetailsField } from '@waldur/marketplace/common/DetailsField';
import { SecretValueField } from '@waldur/marketplace/SecretValueField';
import { OrderDetailsProps } from '@waldur/marketplace/types';
import { BooleanField } from '@waldur/table/BooleanField';

export const OpenStackPackageDetails: FunctionComponent<OrderDetailsProps> = ({
  order: { attributes },
}) => (
  <>
    {ENV.plugins.WALDUR_OPENSTACK.TENANT_CREDENTIALS_VISIBLE && (
      <>
        <DetailsField label={translate('Initial admin username')}>
          {attributes.user_username || translate('Auto-generated')}
        </DetailsField>
        <DetailsField label={translate('Initial admin password')}>
          {attributes.user_password ? (
            <SecretValueField
              className="max-w-300"
              value={attributes.user_password}
            />
          ) : (
            translate('Auto-generated')
          )}
        </DetailsField>
      </>
    )}
    {attributes.subnet_cidr && (
      <DetailsField label={translate('Internal network mask (CIDR)')}>
        {attributes.subnet_cidr}
      </DetailsField>
    )}
    <DetailsField label={translate('Skip connection to external network')}>
      <BooleanField value={attributes.skip_connection_extnet} />
    </DetailsField>
  </>
);
