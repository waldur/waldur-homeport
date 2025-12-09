import { CheckCircleIcon, WarningCircleIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { Card } from 'react-bootstrap';
import { OnboardingVerification } from 'waldur-js-client';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { WizardForm, WizardFormStepProps } from '@waldur/form/WizardForm';
import { translate } from '@waldur/i18n';
import { RadialBg } from '@waldur/navigation/header/search/RadialBg';

import './OrganizationReviewStatus.scss';

interface OrganizationCreateStep3Props extends WizardFormStepProps {
  validationResult?: OnboardingVerification | null;
  validationLoading?: boolean;
}

export const OrganizationCreateStep3: FunctionComponent<
  OrganizationCreateStep3Props
> = (props) => {
  const { validationResult, validationLoading } = props;

  const getStatusIcon = () => {
    if (!validationResult) return null;

    switch (validationResult.status) {
      case 'verified':
        return (
          <div className="validation-icon-wrapper mb-7">
            <CheckCircleIcon size={34} weight="bold" className="text-success" />
          </div>
        );
      case 'escalated':
        return (
          <div className="validation-icon-wrapper mb-7">
            <WarningCircleIcon
              size={34}
              weight="bold"
              className="text-warning"
            />
          </div>
        );
      default:
        return null;
    }
  };

  const getStatusTitle = () => {
    if (!validationResult) return '';

    switch (validationResult.status) {
      case 'verified':
        return translate('Verification successful');
      case 'escalated':
        return translate('Automatic verification failed');
      default:
        return translate('Verification status unknown');
    }
  };

  const getStatusMessage = () => {
    if (!validationResult) return '';

    switch (validationResult.status) {
      case 'verified':
        return translate(
          'Your company representative status is verified. Complete a quick questionnaire to finish setup and access all features.',
        );
      case 'escalated':
        return (
          <>
            {translate(
              "We couldn't automatically verify your company representative status. Please try again or go back to the previous step and proceed with manual verification.",
            )}
            {validationResult.error_message ||
            validationResult.error_traceback ? (
              <>
                <br />
                <br />
                <strong>{translate('Error details:')}</strong>
                <br />
                {validationResult.error_message && (
                  <>
                    <em>{validationResult.error_message}</em>
                    <br />
                  </>
                )}
                {validationResult.error_traceback && (
                  <pre
                    className="mb-0"
                    style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                  >
                    {validationResult.error_traceback}
                  </pre>
                )}
              </>
            ) : null}
          </>
        );
      default:
        return '';
    }
  };

  return (
    <WizardForm {...props}>
      <div className="d-flex flex-column gap-5">
        <Card className="border-0 shadow-sm">
          <Card.Body className="text-center position-relative overflow-hidden organization-validation-result">
            <RadialBg className="icon-background" />
            {validationLoading ? (
              <>
                <LoadingSpinner />
                <h5 className="mt-6 mb-3">
                  {translate('Verifying your company...')}
                </h5>
                <p className="text-muted">
                  {translate(
                    'Please wait while we check your company information in the business registry.',
                  )}
                </p>
              </>
            ) : validationResult ? (
              <>
                {getStatusIcon()}
                <h3 className="mb-3 fw-bold">{getStatusTitle()}</h3>
                <p
                  className="text-muted mb-0 fs-5 mb-20"
                  style={{ maxWidth: '500px', margin: '0 auto' }}
                >
                  {getStatusMessage()}
                </p>
              </>
            ) : (
              <p className="text-muted mb-0">
                {translate('No validation results available.')}
              </p>
            )}
          </Card.Body>
        </Card>
      </div>
    </WizardForm>
  );
};
