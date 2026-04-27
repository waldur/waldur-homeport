import { FunctionComponent } from 'react';

import { ENV } from '@/core/config';
import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import { SecretValueField } from '@/marketplace/SecretValueField';
import { OrderDetailsProps } from '@/marketplace/types';
import { BooleanField } from '@/table/BooleanField';

export const OpenStackTenantDetails: FunctionComponent<OrderDetailsProps> = ({
  order: { attributes },
}) => (
  <>
    {ENV.plugins.WALDUR_OPENSTACK.TENANT_CREDENTIALS_VISIBLE && (
      <>
        <FormTable.Item label={translate('Initial admin username')}>
          {(typeof attributes['user_username'] === 'string' &&
            attributes['user_username']) ||
            translate('Auto-generated')}
        </FormTable.Item>
        <FormTable.Item label={translate('Initial admin password')}>
          {typeof attributes['user_password'] === 'string' ? (
            <SecretValueField
              className="max-w-300"
              value={attributes['user_password']}
            />
          ) : (
            translate('Auto-generated')
          )}
        </FormTable.Item>
      </>
    )}
    {typeof attributes['subnet_cidr'] === 'string' && (
      <FormTable.Item label={translate('Internal network mask (CIDR)')}>
        {attributes['subnet_cidr']}
      </FormTable.Item>
    )}
    {typeof attributes['skip_connection_extnet'] === 'boolean' && (
      <FormTable.Item label={translate('Skip connection to external network')}>
        <BooleanField value={attributes['skip_connection_extnet']} />
      </FormTable.Item>
    )}
  </>
);
