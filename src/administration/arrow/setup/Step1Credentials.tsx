import { FC, useState } from 'react';
import { Alert } from 'react-bootstrap';
import { Field, useForm, useFormState } from 'react-final-form';

import { url, required } from '@waldur/core/validators';
import { StringField } from '@waldur/form';
import { SecretField } from '@waldur/form/SecretField';
import { SubmitButton } from '@waldur/form/SubmitButton';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { WizardModal, WizardStepProps } from '@waldur/wizard';

import { useValidateArrowCredentials } from '../api';
import type { ArrowSetupFormValues } from '../types';

export const Step1Credentials: FC<WizardStepProps> = (props) => {
  const form = useForm<ArrowSetupFormValues>();
  const { values } = useFormState<ArrowSetupFormValues>();
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const validateCredentials = useValidateArrowCredentials();

  const validateAndContinue = async () => {
    setValidating(true);
    setError(null);

    try {
      const response = await validateCredentials.mutateAsync({
        api_url: values.api_url,
        api_key: values.api_key,
      });
      const data = response.data;

      if (data.valid) {
        form.change('credentialsValid', true);
        form.change('partnerInfo', data.partner_info || {});
        // Reset downstream state so Step2 re-discovers
        form.change('discoveryComplete', false);
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

  const isFormValid = Boolean(values.api_url && values.api_key);

  const renderFooter = () => (
    <>
      <CloseDialogButton className="min-w-125px" />
      <SubmitButton
        submitting={validating}
        disabled={!isFormValid}
        label={translate('Validate & Continue')}
        onClick={validateAndContinue}
        type="button"
      />
    </>
  );

  return (
    <WizardModal {...props} renderFooter={renderFooter}>
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
            'Arrow API base URL (e.g., https://xsp.arrow.com/index.php/api/)',
          )}
          required
        >
          <Field name="api_url" component={StringField as any} validate={url} />
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
    </WizardModal>
  );
};
