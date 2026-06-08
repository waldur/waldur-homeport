import { MagnifyingGlassIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { required } from '@/core/validators';
import {
  BooleanEditField,
  SecretEditField,
  SelectEditField,
  StringEditField,
  TextEditField,
} from '@/form/editFields';
import { translate } from '@/i18n';
import { BaseCredentialsSection } from '@/marketplace/offerings/update/integration/BaseCredentialsSection';
import { OfferingEditPanelProps } from '@/marketplace/offerings/update/integration/types';
import { useModal } from '@/modal/actions';
import { TENANT_TYPE } from '@/openstack/constants';
import { ActionButton } from '@/table/ActionButton';

const OpenStackDiscoveryDialog = lazyComponent(() =>
  import('@/openstack/openstack-discovery/OpenStackDiscoveryDialog').then(
    (module) => ({
      default: module.OpenStackDiscoveryDialog,
    }),
  ),
);

const AUTH_TYPE_OPTIONS = [
  { value: 'password', label: translate('Password') },
  {
    value: 'v3applicationcredential',
    label: translate('Application Credential'),
  },
];

export const OpenStackCredentialsSection: FC<OfferingEditPanelProps> = (
  props,
) => {
  const { openDialog } = useModal();

  return (
    <BaseCredentialsSection
      {...props}
      actions={
        props.offering.type === TENANT_TYPE && (
          <ActionButton
            action={() =>
              openDialog(OpenStackDiscoveryDialog, {
                size: 'xl',
                resolve: {
                  offering: props.offering,
                  refetch: props.refetch,
                },
              })
            }
            variant="tertiary"
            iconNode={<MagnifyingGlassIcon weight="bold" />}
            title={translate('Discover')}
            data-testid="credentials-discover-btn"
          />
        )
      }
    >
      <StringEditField
        name="service_attributes.backend_url"
        label={translate('API URL')}
        description={translate(
          'Keystone auth URL (e.g. http://keystone.example.com:5000/v3)',
        )}
        required
        validate={required}
      />
      <SelectEditField
        name="service_attributes.auth_type"
        label={translate('Authentication type')}
        options={AUTH_TYPE_OPTIONS}
        simpleValue
        isClearable={false}
        renderValue={(val) =>
          AUTH_TYPE_OPTIONS.find((o) => o.value === val)?.label ||
          val ||
          'Password'
        }
      />
      <StringEditField
        name="service_attributes.domain"
        label={translate('Domain name')}
      />
      <StringEditField
        name="service_attributes.username"
        label={translate('Username')}
        description={translate('Tenant user username')}
        required
        validate={required}
      />
      <SecretEditField
        name="service_attributes.password"
        label={translate('Password')}
        description={translate('Tenant user password')}
        required
        validate={required}
      />
      <StringEditField
        name="service_attributes.tenant_name"
        label={translate('Tenant name')}
        required
        validate={required}
      />
      <StringEditField
        name="service_attributes.external_network_id"
        label={translate('External network ID')}
        description={translate(
          'It is used to automatically assign floating IP to your virtual machine.',
        )}
        required
        validate={required}
      />
      <TextEditField
        name="secret_options.openstack_api_tls_certificate"
        label={translate('Openstack API TLS certificate')}
      />
      <BooleanEditField
        name="service_attributes.verify_ssl"
        label={translate('Verify server certificate')}
        hideLabel
      />
    </BaseCredentialsSection>
  );
};
