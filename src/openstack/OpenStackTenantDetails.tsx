import { FunctionComponent } from 'react';

import { PropertyItem } from 'waldur-ui';

import { ENV } from '@/core/config';
import { translate } from '@/i18n';
import { SecretValueField } from '@/marketplace/SecretValueField';
import { OrderDetailsProps } from '@/marketplace/types';
import { propVal } from '@/property/propertyFields';

export const OpenStackTenantDetails: FunctionComponent<OrderDetailsProps> = ({
  order: { attributes },
}) => (
  <>
    {ENV.plugins.WALDUR_OPENSTACK.TENANT_CREDENTIALS_VISIBLE && (
      <>
        <PropertyItem
          label={translate('Initial admin username')}
          value={
            typeof attributes['user_username'] === 'string'
              ? attributes['user_username']
              : undefined
          }
          placeholder={translate('Auto-generated')}
        />
        <PropertyItem
          label={translate('Initial admin password')}
          value={
            typeof attributes['user_password'] === 'string' ? (
              <SecretValueField
                className="max-w-300"
                value={attributes['user_password']}
              />
            ) : undefined
          }
          placeholder={translate('Auto-generated')}
        />
      </>
    )}
    <PropertyItem
      label={translate('Internal network mask (CIDR)')}
      value={attributes['subnet_cidr'] as string}
      hideIfEmpty
    />
    <PropertyItem
      label={translate('Skip connection to external network')}
      value={propVal.boolean(attributes['skip_connection_extnet'] as boolean, {
        display: 'badge',
      })}
      hideIfEmpty
    />
  </>
);
