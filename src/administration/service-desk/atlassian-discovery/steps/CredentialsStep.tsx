import { FC, useState } from 'react';
import { useForm, useFormState } from 'react-final-form';
import { supportSettingsAtlassianValidateCredentials } from 'waldur-js-client';

import { AlertItem } from 'waldur-ui';

import { url } from '@/core/validators';
import { StringGroup, RadioGroup, BooleanGroup, SecretGroup } from '@/form';
import { SubmitButton } from '@/form/SubmitButton';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { WizardModal, WizardStepProps } from '@/wizard';

import { getAtlassianAuthMethodChoices } from '../../atlassianAuth';
import { AtlassianFormValues, extractCredentials } from '../types';

const REQUIRED_CREDENTIALS: Record<
  AtlassianFormValues['auth_method'],
  (keyof AtlassianFormValues)[]
> = {
  oauth2_client_credentials: ['client_id', 'client_secret'],
  api_token: ['email', 'token'],
  personal_access_token: ['personal_access_token'],
  basic: ['username', 'password'],
};

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
      const response = await supportSettingsAtlassianValidateCredentials({
        body: extractCredentials(values),
      });

      const data = response.data as any;
      if (data.valid) {
        setServerInfo(data.server_info);
        form.change('resolvedApiUrl', data.api_url || values.api_url);
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

  const isFormValid = () =>
    Boolean(values.api_url && values.auth_method) &&
    (REQUIRED_CREDENTIALS[values.auth_method] || []).every((field) =>
      Boolean(values[field]),
    );

  const isServiceAccount = values.auth_method === 'oauth2_client_credentials';

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
        <h4 className="mb-4">{translate('Sign-in method')}</h4>
        <RadioGroup
          name="auth_method"
          label={translate('Authentication method')}
          choices={getAtlassianAuthMethodChoices()}
          gap={3}
          required
        />
      </div>
      <div className="mb-6">
        <h4 className="mb-4">{translate('Connection Settings')}</h4>

        <StringGroup
          name="api_url"
          validate={url}
          label={
            isServiceAccount ? translate('Site URL') : translate('API URL')
          }
          description={
            isServiceAccount
              ? translate(
                  'Your Atlassian Cloud site, e.g. https://your-domain.atlassian.net. Waldur looks up its cloud ID and connects through the Atlassian API gateway.',
                )
              : translate(
                  'e.g., https://your-domain.atlassian.net or https://jira.example.com',
                )
          }
          required
        />

        <BooleanGroup
          name="verify_ssl"
          label={translate('Verify SSL Certificate')}
        />
      </div>
      {isServiceAccount && (
        <div className="mb-6">
          <h4 className="mb-4">{translate('Service account credential')}</h4>
          <p className="text-muted mb-4">
            {translate(
              'In Atlassian Administration, open Directory, then Service accounts, and create an OAuth 2.0 credential for the service account with the scopes read:servicedesk-request, write:servicedesk-request, manage:servicedesk-customer, read:jira-work, write:jira-work and read:jira-user. The service account needs a Jira Service Management agent licence and the Service Desk Team role on the project.',
            )}
          </p>

          <StringGroup
            name="client_id"
            label={translate('Client ID')}
            help={translate('ID of application used for OAuth authentication.')}
            required
          />

          <SecretGroup
            name="client_secret"
            label={translate('Client secret')}
            help={translate('Application secret key.')}
            required
          />
        </div>
      )}
      {values.auth_method === 'api_token' && (
        <div className="mb-6">
          <h4 className="mb-4">{translate('API Token Authentication')}</h4>
          <p className="text-muted mb-4">
            {translate(
              'For Atlassian Cloud, create an API token at https://id.atlassian.com/manage-profile/security/api-tokens',
            )}
          </p>

          <StringGroup
            name="email"
            label={translate('Email')}
            description={translate('Your Atlassian account email')}
            required
          />

          <SecretGroup name="token" label={translate('API Token')} required />
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

          <SecretGroup
            name="personal_access_token"
            label={translate('Personal Access Token')}
            required
          />
        </div>
      )}
      {values.auth_method === 'basic' && (
        <div className="mb-6">
          <h4 className="mb-4">{translate('Basic Authentication')}</h4>

          <StringGroup name="username" label={translate('Username')} required />

          <SecretGroup name="password" label={translate('Password')} required />
        </div>
      )}
      {error && (
        <AlertItem
          type="floating"
          variant="error"
          title={error}
          className="mb-4"
        />
      )}
      {serverInfo && (
        <AlertItem
          type="floating"
          variant="success"
          title={translate('Connected to Jira {version} ({type})', {
            version: serverInfo.version,
            type: serverInfo.deployment_type,
          })}
          className="mb-4"
        />
      )}
    </WizardModal>
  );
};
