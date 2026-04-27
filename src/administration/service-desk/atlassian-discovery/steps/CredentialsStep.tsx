import { FC, useState } from 'react';
import { Alert } from 'react-bootstrap';
import { Field, useForm, useFormState } from 'react-final-form';
import { supportSettingsAtlassianValidateCredentials } from 'waldur-js-client';

import { url } from '@/core/validators';
import { SelectField, StringField } from '@/form';
import { AwesomeCheckboxField } from '@/form/AwesomeCheckboxField';
import { SecretField } from '@/form/SecretField';
import { SubmitButton } from '@/form/SubmitButton';
import { translate } from '@/i18n';
import { FormGroup } from '@/marketplace/offerings/FormGroup';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { WizardModal, WizardStepProps } from '@/wizard';

import type { AtlassianFormValues } from '../types';

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

/**
 * Step 1: Credentials
 *
 * Validates Atlassian credentials via API before allowing navigation to next step.
 * Uses custom footer because "Next" requires async validation.
 */
export const CredentialsStep: FC<WizardStepProps> = (props) => {
  const form = useForm<AtlassianFormValues>();
  const { values } = useFormState<AtlassianFormValues>();
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serverInfo, setServerInfo] = useState<{
    version: string;
    deployment_type: string;
  } | null>(null);

  const validateAndContinue = async () => {
    setValidating(true);
    setError(null);
    setServerInfo(null);

    try {
      const credentials = {
        api_url: values.api_url,
        auth_method: values.auth_method,
        email: values.email,
        token: values.token,
        personal_access_token: values.personal_access_token,
        username: values.username,
        password: values.password,
        verify_ssl: values.verify_ssl,
      };

      const response = await supportSettingsAtlassianValidateCredentials({
        body: credentials,
      });

      const data = response.data as any;
      if (data.valid) {
        setServerInfo(data.server_info);
        form.change('credentialsValid', true);
        // Advance to next step via form submission
        props.handleSubmit();
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

  const isFormValid = () => {
    if (!values.api_url || !values.auth_method) return false;

    if (values.auth_method === 'api_token') {
      return Boolean(values.email && values.token);
    }
    if (values.auth_method === 'personal_access_token') {
      return Boolean(values.personal_access_token);
    }
    if (values.auth_method === 'basic') {
      return Boolean(values.username && values.password);
    }
    return false;
  };

  // Custom footer for this step
  const renderFooter = () => (
    <>
      <CloseDialogButton className="min-w-125px" />
      <SubmitButton
        submitting={validating}
        disabled={!isFormValid()}
        label={translate('Validate & Continue')}
        onClick={validateAndContinue}
        type="button"
      />
    </>
  );

  return (
    <WizardModal {...props} renderFooter={renderFooter}>
      <div className="mb-6">
        <h4 className="mb-4">{translate('Connection Settings')}</h4>

        <FormGroup
          label={translate('API URL')}
          description={translate(
            'e.g., https://your-domain.atlassian.net or https://jira.example.com',
          )}
          required
        >
          <Field name="api_url" component={StringField as any} validate={url} />
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
            <Field name="email" component={StringField as any} />
          </FormGroup>

          <FormGroup label={translate('API Token')} required>
            <Field name="token" component={SecretField as any} />
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
            />
          </FormGroup>
        </div>
      )}

      {values.auth_method === 'basic' && (
        <div className="mb-6">
          <h4 className="mb-4">{translate('Basic Authentication')}</h4>

          <FormGroup label={translate('Username')} required>
            <Field name="username" component={StringField as any} />
          </FormGroup>

          <FormGroup label={translate('Password')} required>
            <Field name="password" component={SecretField as any} />
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
    </WizardModal>
  );
};
