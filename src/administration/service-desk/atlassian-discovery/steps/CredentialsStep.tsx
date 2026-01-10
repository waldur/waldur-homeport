import { useState } from 'react';
import { Alert } from 'react-bootstrap';
import { Field, Form } from 'react-final-form';
import { supportSettingsAtlassianValidateCredentials } from 'waldur-js-client';

import { required, url } from '@waldur/core/validators';
import { SelectField, StringField } from '@waldur/form';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { SecretField } from '@waldur/form/SecretField';
import { SubmitButton } from '@waldur/form/SubmitButton';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { ActionButton } from '@waldur/table/ActionButton';

import type { AtlassianCredentials } from '../types';

const AUTH_METHODS = [
  {
    value: 'api_token',
    label: translate('API Token (Atlassian Cloud)'),
  },
  {
    value: 'personal_access_token',
    label: translate('Personal Access Token (Server/Data Center)'),
  },
  {
    value: 'basic',
    label: translate('Basic Authentication'),
  },
];

interface CredentialsStepProps {
  initialValues?: Partial<AtlassianCredentials>;
  onValidated: (credentials: AtlassianCredentials) => void;
  onCancel: () => void;
}

export const CredentialsStep = ({
  initialValues,
  onValidated,
  onCancel,
}: CredentialsStepProps) => {
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serverInfo, setServerInfo] = useState<{
    version: string;
    deployment_type: string;
  } | null>(null);

  const handleSubmit = async (values: AtlassianCredentials) => {
    setValidating(true);
    setError(null);
    setServerInfo(null);

    try {
      const response = await supportSettingsAtlassianValidateCredentials({
        body: values,
      });

      const data = response.data as any;
      if (data.valid) {
        setServerInfo(data.server_info);
        onValidated(values);
      } else {
        setError(data.error || translate('Invalid credentials'));
      }
    } catch (e: any) {
      setError(
        e.response?.data?.detail ||
          e.message ||
          translate('Failed to validate credentials'),
      );
    } finally {
      setValidating(false);
    }
  };

  const validate = (values: AtlassianCredentials) => {
    const errors: Record<string, string> = {};

    if (!values.api_url) {
      errors.api_url = translate('API URL is required');
    }

    if (!values.auth_method) {
      errors.auth_method = translate('Authentication method is required');
    }

    if (values.auth_method === 'api_token') {
      if (!values.email) {
        errors.email = translate('Email is required for API Token auth');
      }
      if (!values.token) {
        errors.token = translate('API Token is required');
      }
    }

    if (values.auth_method === 'personal_access_token') {
      if (!values.personal_access_token) {
        errors.personal_access_token = translate(
          'Personal Access Token is required',
        );
      }
    }

    if (values.auth_method === 'basic') {
      if (!values.username) {
        errors.username = translate('Username is required');
      }
      if (!values.password) {
        errors.password = translate('Password is required');
      }
    }

    return errors;
  };

  return (
    <Form
      onSubmit={handleSubmit}
      validate={validate}
      initialValues={{
        auth_method: 'api_token',
        verify_ssl: true,
        ...initialValues,
      }}
      render={({ handleSubmit, values, invalid }) => (
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <h4 className="mb-4">{translate('Connection Settings')}</h4>

            <FormGroup
              label={translate('API URL')}
              description={translate(
                'e.g., https://your-domain.atlassian.net or https://jira.example.com',
              )}
              required
            >
              <Field
                name="api_url"
                component={StringField as any}
                validate={url}
              />
            </FormGroup>

            <FormGroup label={translate('Authentication Method')} required>
              <Field
                name="auth_method"
                component={SelectField as any}
                options={AUTH_METHODS}
                simpleValue
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

          {values.auth_method === 'api_token' && (
            <div className="mb-6">
              <h4 className="mb-4">{translate('API Token Authentication')}</h4>
              <p className="text-muted mb-4">
                {translate(
                  'For Atlassian Cloud, create an API token at https://id.atlassian.com/manage-profile/security/api-tokens',
                )}
              </p>

              <FormGroup
                label={translate('Email')}
                description={translate('Your Atlassian account email')}
                required
              >
                <Field
                  name="email"
                  component={StringField as any}
                  validate={required}
                />
              </FormGroup>

              <FormGroup label={translate('API Token')} required>
                <Field
                  name="token"
                  component={SecretField as any}
                  validate={required}
                />
              </FormGroup>
            </div>
          )}

          {values.auth_method === 'personal_access_token' && (
            <div className="mb-6">
              <h4 className="mb-4">
                {translate('Personal Access Token Authentication')}
              </h4>
              <p className="text-muted mb-4">
                {translate(
                  'For Jira Server/Data Center, create a PAT in your profile settings.',
                )}
              </p>

              <FormGroup label={translate('Personal Access Token')} required>
                <Field
                  name="personal_access_token"
                  component={SecretField as any}
                  validate={required}
                />
              </FormGroup>
            </div>
          )}

          {values.auth_method === 'basic' && (
            <div className="mb-6">
              <h4 className="mb-4">{translate('Basic Authentication')}</h4>

              <FormGroup label={translate('Username')} required>
                <Field
                  name="username"
                  component={StringField as any}
                  validate={required}
                />
              </FormGroup>

              <FormGroup label={translate('Password')} required>
                <Field
                  name="password"
                  component={SecretField as any}
                  validate={required}
                />
              </FormGroup>
            </div>
          )}

          {error && (
            <Alert variant="danger" className="mb-4">
              {error}
            </Alert>
          )}

          {serverInfo && (
            <Alert variant="success" className="mb-4">
              {translate('Connected to Jira {version} ({type})', {
                version: serverInfo.version,
                type: serverInfo.deployment_type,
              })}
            </Alert>
          )}

          <div className="d-flex justify-content-end gap-2">
            <ActionButton
              action={onCancel}
              variant="secondary"
              title={translate('Cancel')}
            />
            <SubmitButton
              submitting={validating}
              disabled={invalid}
              label={translate('Validate & Continue')}
            />
          </div>
        </form>
      )}
    />
  );
};
