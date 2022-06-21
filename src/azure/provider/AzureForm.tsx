import { FunctionComponent } from 'react';

import { isGuid, required } from '@waldur/core/validators';
import { FormContainer, StringField } from '@waldur/form';
import { translate } from '@waldur/i18n';

const defaultValidtors = [required, isGuid];

export const AzureForm: FunctionComponent<{ container }> = ({ container }) => (
  <FormContainer {...container}>
    <StringField
      name="subscription_id"
      label={translate('Subscription ID')}
      description={translate('In the format of GUID')}
      required={true}
      validate={defaultValidtors}
    />
    <StringField
      name="tenant_id"
      label={translate('Tenant ID')}
      description={translate('In the format of GUID')}
      required={true}
      validate={defaultValidtors}
    />
    <StringField
      name="client_id"
      label={translate('Client ID')}
      description={translate('In the format of GUID')}
      required={true}
      validate={defaultValidtors}
    />
    <StringField
      name="client_secret"
      label={translate('Client secret')}
      description={translate('Azure Active Directory Application Secret')}
      required={true}
      validate={required}
    />
  </FormContainer>
);
