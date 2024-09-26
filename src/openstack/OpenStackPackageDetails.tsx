import { FunctionComponent } from 'react';

import { ENV } from '@waldur/configs/default';
import { translate } from '@waldur/i18n';
import { SecretValueField } from '@waldur/marketplace/SecretValueField';
import { OrderDetailsProps } from '@waldur/marketplace/types';
import { Field } from '@waldur/resource/summary';
import { BooleanField } from '@waldur/table/BooleanField';

export const OpenStackPackageDetails: FunctionComponent<OrderDetailsProps> = ({
  order: { attributes },
}) => (
  <>
    {ENV.plugins.WALDUR_OPENSTACK.TENANT_CREDENTIALS_VISIBLE && (
      <>
        <Field label={translate('Initial admin username')}>
          {attributes.user_username || translate('Auto-generated')}
        </Field>
        <Field label={translate('Initial admin password')}>
          {attributes.user_password ? (
            <SecretValueField
              className="max-w-300"
              value={attributes.user_password}
            />
          ) : (
            translate('Auto-generated')
          )}
        </Field>
      </>
    )}
    {attributes.subnet_cidr && (
      <Field label={translate('Internal network mask (CIDR)')}>
        {attributes.subnet_cidr}
      </Field>
    )}
    <Field label={translate('Skip connection to external network')}>
      <BooleanField value={attributes.skip_connection_extnet} />
    </Field>
  </>
);
