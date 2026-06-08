import { FC } from 'react';

import { composeValidators, isGuid, required } from '@/core/validators';
import { StringEditField } from '@/form/editFields';
import { translate } from '@/i18n';
import { BaseCredentialsSection } from '@/marketplace/offerings/update/integration/BaseCredentialsSection';
import { OfferingEditPanelProps } from '@/marketplace/offerings/update/integration/types';

const validateGuid = composeValidators(required, isGuid);

export const AzureCredentialsSection: FC<OfferingEditPanelProps> = (props) => {
  return (
    <BaseCredentialsSection {...props}>
      <StringEditField
        name="service_attributes.subscription_id"
        label={translate('Subscription ID')}
        description={translate('In the format of GUID')}
        required
        validate={validateGuid}
      />
      <StringEditField
        name="service_attributes.tenant_id"
        label={translate('Tenant ID')}
        description={translate('In the format of GUID')}
        required
        validate={validateGuid}
      />
      <StringEditField
        name="service_attributes.client_id"
        label={translate('Client ID')}
        description={translate('In the format of GUID')}
        required
        validate={validateGuid}
      />
      <StringEditField
        name="service_attributes.client_secret"
        label={translate('Client secret')}
        description={translate('Azure Active Directory Application Secret')}
        required
        validate={required}
      />
    </BaseCredentialsSection>
  );
};
