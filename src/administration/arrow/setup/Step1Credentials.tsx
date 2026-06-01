import { FC, useState } from 'react';
import { Alert } from 'react-bootstrap';
import { useForm, useFormState } from 'react-final-form';

import { url, required } from '@/core/validators';
import { StringGroup, SecretGroup } from '@/form';
import { SubmitButton } from '@/form/SubmitButton';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { WizardModal, WizardStepProps } from '@/wizard';

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

        <StringGroup
          name="api_url"
          validate={url}
          label={translate('API URL')}
          description={translate(
            'Arrow API base URL (e.g., https://xsp.arrow.com/index.php/api/)',
          )}
          required
        />

        <SecretGroup
          name="api_key"
          validate={required}
          label={translate('API Key')}
          description={translate('Your Arrow API key')}
          required
        />
      </div>
      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}
    </WizardModal>
  );
};
