import { required } from '@/core/validators';
import { StringGroup, SecretGroup } from '@/form';
import { translate } from '@/i18n';

export const CredentialsTab = () => (
  <div className="size-lg">
    <StringGroup
      name="api_url"
      label={translate('API URL')}
      placeholder={translate('e.g. waldur.example.com')}
      required={true}
      validate={required}
      maxLength={150}
      disabled={false}
    />

    <SecretGroup
      name="token"
      label={translate('Authentication token')}
      placeholder={translate('e.g. SECRET_TOKEN')}
      required={true}
      validate={required}
      disabled={false}
    />
  </div>
);
