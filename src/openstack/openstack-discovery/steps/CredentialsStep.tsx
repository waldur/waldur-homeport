import { FC, useState } from 'react';
import { Alert } from 'react-bootstrap';
import { useForm, useFormState } from 'react-final-form';
import { openstackDiscoveryValidateCredentials } from 'waldur-js-client';

import {
  StringGroup,
  SelectGroup,
  SecretGroup,
  BooleanGroup,
  TextGroup,
} from '@/form';
import { SubmitButton } from '@/form/SubmitButton';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { WizardModal, WizardStepProps } from '@/wizard';

import { extractCredentials, OpenStackDiscoveryFormValues } from '../types';

const AUTH_TYPE_OPTIONS = [
  { value: 'password', label: translate('Password') },
  {
    value: 'v3applicationcredential',
    label: translate('Application Credential'),
  },
];

export const CredentialsStep: FC<WizardStepProps> = (props) => {
  const form = useForm<OpenStackDiscoveryFormValues>();
  const { values } = useFormState<OpenStackDiscoveryFormValues>();
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateAndContinue = async () => {
    setValidating(true);
    setError(null);

    try {
      const response = await openstackDiscoveryValidateCredentials({
        body: extractCredentials(values),
      });

      const data = response.data;
      if (data.valid) {
        form.change('credentialsValid', true);
        form.change('serverInfo', data.server_info || null);
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
    return Boolean(values.auth_url && values.username && values.password);
  };

  const renderFooter = () => (
    <>
      <CloseDialogButton className="min-w-125px" />
      <SubmitButton
        submitting={validating}
        disabled={!isFormValid()}
        label={translate('Validate & Continue')}
        onClick={validateAndContinue}
        type="button"
        data-testid="discovery-validate-btn"
      />
    </>
  );

  return (
    <WizardModal {...props} renderFooter={renderFooter}>
      <div className="mb-6">
        <h4 className="mb-4">{translate('Connection Settings')}</h4>

        <StringGroup
          name="auth_url"
          label={translate('Auth URL')}
          description={translate(
            'Keystone URL, e.g. https://cloud.example.com:5000/v3',
          )}
          required
        />

        <SelectGroup
          name="auth_type"
          options={AUTH_TYPE_OPTIONS}
          simpleValue
          isClearable={false}
          label={translate('Authentication type')}
        />

        <StringGroup
          name="username"
          label={
            values.auth_type === 'v3applicationcredential'
              ? translate('Application Credential ID')
              : translate('Username')
          }
          required
        />

        <SecretGroup
          name="password"
          label={
            values.auth_type === 'v3applicationcredential'
              ? translate('Application Credential Secret')
              : translate('Password')
          }
          required
        />

        <div className="row">
          <div className="col-sm-6">
            <StringGroup
              name="user_domain_name"
              placeholder="Default"
              label={translate('User domain name')}
              description={translate('Default: "Default"')}
            />
          </div>
          <div className="col-sm-6">
            <StringGroup
              name="project_domain_name"
              placeholder="Default"
              label={translate('Project domain name')}
              description={translate('Default: "Default"')}
            />
          </div>
        </div>

        <StringGroup
          name="project_name"
          placeholder="admin"
          label={translate('Project name')}
          description={translate('Default: "admin"')}
        />

        <BooleanGroup
          name="verify_ssl"
          label={translate('Verify SSL certificate')}
        />

        <TextGroup
          name="certificate"
          rows={4}
          label={translate('CA Certificate')}
          description={translate(
            'Optional PEM-encoded CA certificate for SSL verification',
          )}
        />
      </div>
      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}
      {values.serverInfo && (
        <Alert variant="success" className="mb-4">
          {translate('Connected to OpenStack (project: {project})', {
            project: values.serverInfo.project_name,
          })}
        </Alert>
      )}
    </WizardModal>
  );
};
