import { useState } from 'react';
import { Alert } from 'react-bootstrap';
import { Field, Form } from 'react-final-form';
import type { ArrowCredentialsRequest } from 'waldur-js-client';

import { required, url } from '@waldur/core/validators';
import { StringField } from '@waldur/form';
import { SecretField } from '@waldur/form/SecretField';
import { SubmitButton } from '@waldur/form/SubmitButton';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { ActionButton } from '@waldur/table/ActionButton';

import { useValidateArrowCredentials } from '../api';

interface Step1CredentialsProps {
  onValidated: (
    credentials: ArrowCredentialsRequest,
    partnerInfo: Record<string, unknown>,
  ) => void;
  onCancel: () => void;
}

export const Step1Credentials = ({
  onValidated,
  onCancel,
}: Step1CredentialsProps) => {
  const [error, setError] = useState<string | null>(null);
  const validateCredentials = useValidateArrowCredentials();

  const handleSubmit = async (values: ArrowCredentialsRequest) => {
    setError(null);

    try {
      const response = await validateCredentials.mutateAsync(values);
      const data = response.data;

      if (data.valid) {
        onValidated(values, data.partner_info || {});
      } else {
        setError(data.error || translate('Invalid credentials'));
      }
    } catch (e: any) {
      setError(
        e.response?.data?.detail ||
          e.message ||
          translate('Failed to validate credentials'),
      );
    }
  };

  const validate = (values: ArrowCredentialsRequest) => {
    const errors: Record<string, string> = {};

    if (!values.api_url) {
      errors.api_url = translate('API URL is required');
    }

    if (!values.api_key) {
      errors.api_key = translate('API Key is required');
    }

    return errors;
  };

  return (
    <Form
      onSubmit={handleSubmit}
      validate={validate}
      initialValues={{
        api_url: 'https://xsp.arrow.com',
      }}
      render={({ handleSubmit, invalid }) => (
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <h4 className="mb-4">{translate('Arrow API Credentials')}</h4>
            <p className="text-muted mb-4">
              {translate(
                'Enter your Arrow API credentials to connect your ArrowSphere account.',
              )}
            </p>

            <FormGroup
              label={translate('API URL')}
              description={translate(
                'Arrow API base URL (e.g., https://xsp.arrow.com)',
              )}
              required
            >
              <Field
                name="api_url"
                component={StringField as any}
                validate={url}
              />
            </FormGroup>

            <FormGroup
              label={translate('API Key')}
              description={translate('Your Arrow API key')}
              required
            >
              <Field
                name="api_key"
                component={SecretField as any}
                validate={required}
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
              submitting={validateCredentials.isPending}
              disabled={invalid}
              label={translate('Validate & Continue')}
            />
          </div>
        </form>
      )}
    />
  );
};
