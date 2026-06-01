import { FC } from 'react';
import { Alert } from 'react-bootstrap';

import { required, url as urlValidator } from '@/core/validators';
import { StringGroup, SecretGroup, BooleanGroup } from '@/form';
import { translate } from '@/i18n';
import { WizardModal, WizardStepProps } from '@/wizard';

export const ConnectionStep: FC<WizardStepProps> = (props) => {
  const existingProvider = props.data?.existingProvider;

  return (
    <WizardModal {...props}>
      {existingProvider && (
        <Alert variant="info" className="mb-4">
          {translate('Re-discovering settings for: {label}', {
            label: existingProvider.label || existingProvider.provider,
          })}
        </Alert>
      )}
      <div className="mb-6">
        <h4 className="mb-4">{translate('OIDC Connection Settings')}</h4>

        <StringGroup
          name="discovery_url"
          validate={(value) => required(value) || urlValidator(value)}
          placeholder="https://idp.example.com/.well-known/openid-configuration"
          label={translate('Discovery URL')}
          description={translate(
            'The OIDC discovery endpoint URL. You can enter either the full .well-known/openid-configuration URL or the issuer base URL.',
          )}
          required
        />

        <StringGroup
          name="client_id"
          validate={required}
          label={translate('Client ID')}
          description={translate(
            'The OAuth2/OIDC client ID registered with your identity provider.',
          )}
          required
        />

        <SecretGroup
          name="client_secret"
          validate={required}
          label={translate('Client Secret')}
          description={translate('The OAuth2/OIDC client secret.')}
          required
        />

        <BooleanGroup
          name="verify_ssl"
          label={translate('Verify SSL Certificate')}
        />
      </div>
    </WizardModal>
  );
};
