import { required } from '@waldur/core/validators';
import { StringField, FormContainer, SecretField } from '@waldur/form';
import { translate } from '@waldur/i18n';

export const CredentialsTab = () => (
  <FormContainer submitting={false} clearOnUnmount={false}>
    <StringField
      name="api_url"
      label={translate('Remote Waldur API URL')}
      required={true}
      validate={required}
      maxLength={150}
    />
    <SecretField
      name="token"
      label={translate('Authentication token')}
      required={true}
      validate={required}
    />
  </FormContainer>
);
