import { FunctionComponent } from 'react';

import { SecretEditField, StringEditField } from '@/form/editFields';
import { translate } from '@/i18n';
import { BaseProvisioningConfigSection } from '@/marketplace/offerings/update/integration/ProvisioningConfigSection';
import { OfferingEditPanelProps } from '@/marketplace/offerings/update/integration/types';

export const RemoteOfferingSecretOptions: FunctionComponent<
  OfferingEditPanelProps
> = (props) => {
  return (
    <BaseProvisioningConfigSection {...props}>
      <StringEditField
        name="secret_options.api_url"
        label={translate('API URL')}
      />
      <SecretEditField name="secret_options.token" label={translate('Token')} />
      <StringEditField
        name="secret_options.customer_uuid"
        label={translate('Organization UUID')}
      />
    </BaseProvisioningConfigSection>
  );
};
