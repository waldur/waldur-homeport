import { useRouter } from '@uirouter/react';
import { FC, useCallback, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { formValueSelector } from 'redux-form';

import { ProgressStep } from '@waldur/core/ProgressSteps';
import { VerticalProgressSteps } from '@waldur/core/VerticalProgressSteps';
import { SidebarLayout } from '@waldur/form/SidebarLayout';
import { WizardFormContainer } from '@waldur/form/WizardFormContainer';
import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { useNotify } from '@waldur/store/hooks';

import { ORGANIZATION_ONBOARDING_FORM_ID } from '../constants';

import { useAutoValidation, useChecklistCache } from './hooks';
import { OrganizationCreateStep1 } from './OrganizationCreateStep1';
import { OrganizationCreateStep2 } from './OrganizationCreateStep2';
import { OrganizationCreateStep3 } from './OrganizationCreateStep3';
import { OrganizationCreateStep4 } from './OrganizationCreateStep4';
import { OrganizationReviewStatus } from './OrganizationReviewStatus';
import {
  handleAutoIntentAnswers,
  handleManualVerification,
  handleVerificationStatus,
} from './utils';

export const OrganizationCreatePage: FC = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { showSuccess, showErrorResponse } = useNotify();

  const selector = formValueSelector(ORGANIZATION_ONBOARDING_FORM_ID);
  const addMethod =
    useSelector((state) => selector(state, 'addMethod')) || 'manual';
  const isManual = addMethod === 'manual';

  const { getChecklistData } = useChecklistCache();
  const {
    validationLoading,
    validationResult,
    verificationData,
    runAutoValidation,
  } = useAutoValidation(getChecklistData);

  const [submissionComplete, setSubmissionComplete] = useState(false);
  const [submittedCompanyName, setSubmittedCompanyName] = useState<string>('');

  const handleStep2Submit = useCallback(
    async (formData) => {
      if (formData.addMethod === 'auto') {
        await runAutoValidation(formData);
      }
    },
    [runAutoValidation],
  );

  // Wrapper for Step 2 to handle auto-validation requests on submit
  const Step2Wrapper: FC<any> = useCallback(
    (props) => {
      const customOnSubmit = async (formData, dispatch, formProps) => {
        await handleStep2Submit(formData);
        if (props.onSubmit) {
          props.onSubmit(formData, dispatch, formProps);
        }
      };

      return (
        <OrganizationCreateStep2
          {...props}
          onSubmit={customOnSubmit}
          getChecklistData={getChecklistData}
        />
      );
    },
    [handleStep2Submit, getChecklistData],
  );

  // Wrapper for Step 3 to pass validation data
  const Step3Wrapper: FC<any> = useCallback(
    (props) => {
      return (
        <OrganizationCreateStep3
          {...props}
          validationResult={validationResult}
          validationLoading={validationLoading}
        />
      );
    },
    [validationResult, validationLoading],
  );

  // Wrapper for Step 4 to pass checklist data
  const Step4Wrapper: FC<any> = useCallback(
    (props) => {
      return (
        <OrganizationCreateStep4
          {...props}
          getChecklistData={getChecklistData}
        />
      );
    },
    [getChecklistData],
  );

  const wizardForms = useMemo(
    () => [OrganizationCreateStep1, Step2Wrapper, Step3Wrapper, Step4Wrapper],
    [Step2Wrapper, Step3Wrapper, Step4Wrapper],
  );

  const steps: ProgressStep[] = useMemo(
    () => [
      {
        key: 'verification',
        label: translate('Verification'),
        description: translate(
          'Confirm your identity through the national provider',
        ),
        completed: false,
      },
      {
        key: 'company',
        label: translate('Company'),
        description: translate('Provide company details'),
        completed: false,
      },
      {
        key: 'result',
        label: translate('Result'),
        description: translate('Review results of validation'),
        completed: isManual, // Mark as completed if manual mode
      },
      {
        key: 'intent',
        label: translate('Intent'),
        description: translate(
          'Describe your purpose and finalise the registration',
        ),
        completed: false,
      },
    ],
    [isManual],
  );

  const handleCancel = useCallback(async () => {
    await waitForConfirmation(
      dispatch,
      translate('Cancel organization creation'),
      translate(
        'Are you sure you want to cancel? All entered data will be lost.',
      ),
    );
    router.stateService.go('profile.details');
  }, [dispatch, router]);

  const createOnboardingVerification = useCallback(
    async (formData, _dispatch, formProps) => {
      try {
        const isManual = formData.addMethod === 'manual';
        let validation = isManual ? null : validationResult;

        if (isManual) {
          validation = await handleManualVerification(
            formData,
            verificationData,
            getChecklistData,
          );
        } else {
          await handleAutoIntentAnswers(formData, validation, getChecklistData);
        }

        await handleVerificationStatus(validation, formData, {
          onSuccess: () => {
            showSuccess(translate('Organization created!'));
            formProps.destroy();
            router.stateService.go('profile.details');
          },
          onReview: (companyName) => {
            setSubmittedCompanyName(companyName);
            setSubmissionComplete(true);
          },
          onError: (e) => {
            showErrorResponse(e, translate('Unable to create organization.'));
          },
        });
      } catch (e) {
        showErrorResponse(e, translate('Unable to verify company.'));
      }
    },
    [
      showSuccess,
      showErrorResponse,
      router,
      validationResult,
      verificationData,
      getChecklistData,
    ],
  );

  return (
    <>
      <SidebarLayout.Header>
        <div className="w-100">
          <h1 className="mb-2">{translate('Create organization')}</h1>
          <p className="text-muted mb-0">
            {translate(
              'Register your organization with automatic business verification',
            )}
          </p>
        </div>
      </SidebarLayout.Header>
      <div className="container-xxl">
        {submissionComplete ? (
          <div className="d-flex gap-7">
            <div className="flex-shrink-0" style={{ width: '300px' }}>
              <VerticalProgressSteps
                steps={steps.map((step) => ({ ...step, completed: true }))}
              />
            </div>
            <div className="flex-grow-1">
              <OrganizationReviewStatus
                onGoToDashboard={() =>
                  router.stateService.go('profile.details')
                }
                companyName={submittedCompanyName}
              />
            </div>
          </div>
        ) : (
          <WizardFormContainer
            form={ORGANIZATION_ONBOARDING_FORM_ID}
            title=""
            onSubmit={createOnboardingVerification}
            steps={steps}
            wizardForms={wizardForms}
            submitLabel={translate('Create')}
            nextLabel={translate('Next')}
            verticalLayout={true}
            onCancel={handleCancel}
            skipSteps={isManual ? [2] : []}
          />
        )}
      </div>
    </>
  );
};
