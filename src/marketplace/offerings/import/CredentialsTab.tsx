import { required } from '@/core/validators';
import { StringField, FormContainerFinal, SecretField } from '@/form';
import { translate } from '@/i18n';

export const CredentialsTab = () => (
  <FormContainerFinal submitting={false} className="size-lg">
    <StringField
      name="api_url"
      label={translate('API URL')}
      placeholder={translate('e.g. waldur.example.com')}
      required={true}
      validate={required}
      maxLength={150}
    />

    <SecretField
      name="token"
      label={translate('Authentication token')}
      placeholder={translate('e.g. SECRET_TOKEN')}
      required={true}
      validate={required}
    />
  </FormContainerFinal>
);
