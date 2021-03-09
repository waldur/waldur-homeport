import { required } from '@waldur/core/validators';
import { StringField, FormContainer, SecretField } from '@waldur/form';
import { TranslateProps, withTranslation } from '@waldur/i18n';

export const CredentialsTab = withTranslation((props: TranslateProps) => (
  <FormContainer submitting={false} layout="vertical" clearOnUnmount={false}>
    <StringField
      name="api_url"
      label={props.translate('Remote Waldur API URL')}
      required={true}
      validate={required}
      maxLength={150}
    />
    <SecretField
      name="token"
      label={props.translate('Authentication token')}
      required={true}
      validate={required}
    />
  </FormContainer>
));
