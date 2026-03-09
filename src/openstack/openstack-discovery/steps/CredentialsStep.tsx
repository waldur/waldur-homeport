import { FC, useState } from 'react';
import { Alert } from 'react-bootstrap';
import { Field, useForm, useFormState } from 'react-final-form';
import { openstackDiscoveryValidateCredentials } from 'waldur-js-client';

import { SelectField, StringField, TextField } from '@waldur/form';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { SecretField } from '@waldur/form/SecretField';
import { SubmitButton } from '@waldur/form/SubmitButton';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { WizardModal, WizardStepProps } from '@waldur/wizard';

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

        <FormGroup
          label={translate('Auth URL')}
          description={translate(
            'Keystone URL, e.g. https://cloud.example.com:5000/v3',
          )}
          required
        >
          <Field name="auth_url" component={StringField as any} />
        </FormGroup>

        <FormGroup label={translate('Authentication type')}>
          <Field
            name="auth_type"
            component={SelectField as any}
            options={AUTH_TYPE_OPTIONS}
            simpleValue
            isClearable={false}
          />
        </FormGroup>

        <FormGroup
          label={
            values.auth_type === 'v3applicationcredential'
              ? translate('Application Credential ID')
              : translate('Username')
          }
          required
        >
          <Field name="username" component={StringField as any} />
        </FormGroup>

        <FormGroup
          label={
            values.auth_type === 'v3applicationcredential'
              ? translate('Application Credential Secret')
              : translate('Password')
          }
          required
        >
          <Field name="password" component={SecretField as any} />
        </FormGroup>

        <div className="row">
          <div className="col-sm-6">
            <FormGroup
              label={translate('User domain name')}
              description={translate('Default: "Default"')}
            >
              <Field
                name="user_domain_name"
                component={StringField as any}
                placeholder="Default"
              />
            </FormGroup>
          </div>
          <div className="col-sm-6">
            <FormGroup
              label={translate('Project domain name')}
              description={translate('Default: "Default"')}
            >
              <Field
                name="project_domain_name"
                component={StringField as any}
                placeholder="Default"
              />
            </FormGroup>
          </div>
        </div>

        <FormGroup
          label={translate('Project name')}
          description={translate('Default: "admin"')}
        >
          <Field
            name="project_name"
            component={StringField as any}
            placeholder="admin"
          />
        </FormGroup>

        <FormGroup>
          <Field
            name="verify_ssl"
            component={AwesomeCheckboxField as any}
            label={translate('Verify SSL certificate')}
          />
        </FormGroup>

        <FormGroup
          label={translate('CA Certificate')}
          description={translate(
            'Optional PEM-encoded CA certificate for SSL verification',
          )}
        >
          <Field name="certificate" component={TextField as any} rows={4} />
        </FormGroup>
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
