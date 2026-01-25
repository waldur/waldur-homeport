import { useState } from 'react';
import { Alert } from 'react-bootstrap';
import { Field, Form } from 'react-final-form';

import { required, url } from '@waldur/core/validators';
import { SecretField, StringField } from '@waldur/form';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { SubmitButton } from '@waldur/form/SubmitButton';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { ActionButton } from '@waldur/table/ActionButton';

import type { StepProps } from '../types';

interface FormValues {
  discovery_url: string;
  verify_ssl: boolean;
  client_id: string;
  client_secret: string;
}

export const ConnectionStep = ({
  state,
  updateState,
  onNext,
  onCancel,
}: StepProps) => {
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (values: FormValues) => {
    setError(null);

    // Validate discovery URL format
    if (!values.discovery_url.includes('.well-known/openid-configuration')) {
      // Auto-append the well-known path if it's a base URL
      const discoveryUrl = values.discovery_url.endsWith('/')
        ? `${values.discovery_url}.well-known/openid-configuration`
        : `${values.discovery_url}/.well-known/openid-configuration`;
      values.discovery_url = discoveryUrl;
    }

    updateState({
      connection: {
        discovery_url: values.discovery_url,
        verify_ssl: values.verify_ssl,
      },
      connectionValid: true,
      clientId: values.client_id,
      clientSecret: values.client_secret,
    });

    onNext();
  };

  const initialValues: FormValues = {
    discovery_url: state.connection?.discovery_url || '',
    verify_ssl: state.connection?.verify_ssl ?? true,
    client_id: state.clientId || state.existingProvider?.client_id || '',
    client_secret: state.clientSecret || '',
  };

  const isReDiscovery = Boolean(state.existingProvider);

  return (
    <Form
      onSubmit={handleSubmit}
      initialValues={initialValues}
      render={({ handleSubmit, invalid, submitting }) => (
        <form onSubmit={handleSubmit}>
          {isReDiscovery && (
            <Alert variant="info" className="mb-4">
              {translate('Re-discovering settings for: {label}', {
                label:
                  state.existingProvider?.label ||
                  state.existingProvider?.provider,
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
                validate={(value) => required(value) || url(value)}
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

          {error && (
            <Alert variant="danger" className="mb-4">
              {error}
            </Alert>
          )}

          <div className="d-flex justify-content-end gap-2">
            <ActionButton
              action={onCancel}
              variant="secondary"
              title={translate('Cancel')}
            />
            <SubmitButton
              submitting={submitting}
              disabled={invalid}
              label={translate('Continue')}
            />
          </div>
        </form>
      )}
    />
  );
};
