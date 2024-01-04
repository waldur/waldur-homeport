import { FormContainer, StringField } from '@waldur/form';
import { translate } from '@waldur/i18n';

export const SmaxSettings = () => (
  <FormContainer submitting={false} clearOnUnmount={false} floating={true}>
    <StringField
      name="SMAX_API_URL"
      label={translate('API URL')}
      maxLength={150}
    />
    <StringField
      name="SMAX_TENANT_ID"
      label={translate('Tenant ID')}
      maxLength={150}
    />
    <StringField name="SMAX_LOGIN" label={translate('Login')} maxLength={150} />
  </FormContainer>
);
