import { FC } from 'react';
import { Alert } from 'react-bootstrap';
import { Field } from 'react-final-form';

import { required, url as urlValidator } from '@waldur/core/validators';
import { SecretField, StringField } from '@waldur/form';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { WizardModal, WizardStepProps } from '@waldur/wizard';

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

        <FormGroup
          label={translate('Discovery URL')}
          description={translate(
            'The OIDC discovery endpoint URL. You can enter either the full .well-known/openid-configuration URL or the issuer base URL.',
          )}
          required
        >
          <Field
            name="discovery_url"
            component={StringField as any}
            validate={(value) => required(value) || urlValidator(value)}
            placeholder="https://idp.example.com/.well-known/openid-configuration"
          />
        </FormGroup>

        <FormGroup
          label={translate('Client ID')}
          description={translate(
            'The OAuth2/OIDC client ID registered with your identity provider.',
          )}
          required
        >
          <Field
            name="client_id"
            component={StringField as any}
            validate={required}
          />
        </FormGroup>

        <FormGroup
          label={translate('Client Secret')}
          description={translate('The OAuth2/OIDC client secret.')}
          required
        >
          <Field
            name="client_secret"
            component={SecretField as any}
            validate={required}
          />
        </FormGroup>

        <FormGroup>
          <Field
            name="verify_ssl"
            component={AwesomeCheckboxField as any}
            label={translate('Verify SSL Certificate')}
          />
        </FormGroup>
      </div>
    </WizardModal>
  );
};
