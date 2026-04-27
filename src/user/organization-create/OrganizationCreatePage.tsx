import { useRouter } from '@uirouter/react';
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { formValueSelector } from 'redux-form';
import { onboardingVerificationsDestroy } from 'waldur-js-client';

import { ProgressStep } from '@/core/ProgressSteps';
import { VerticalProgressSteps } from '@/core/VerticalProgressSteps';
import { SidebarLayout } from '@/form/SidebarLayout';
import { WizardFormContainer } from '@/form/WizardFormContainer';
import { translate } from '@/i18n';
import { waitForConfirmation } from '@/modal/actions';
import { useNotify } from '@/store/hooks';

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
  const validationMethod = useSelector((state) =>
    selector(state, 'validationMethod'),
  );

  const isManual = validationMethod === 'manual';

  const { getChecklistData } = useChecklistCache();
  const {
    validationLoading,
    validationResult,
    verificationData,
    setVerificationData,
    runAutoValidation,
  } = useAutoValidation(getChecklistData);

  const [submissionComplete, setSubmissionComplete] = useState(false);
  const [submittedCompanyName, setSubmittedCompanyName] = useState<string>('');
  const submissionCompleteRef = useRef(false);

  // Cleanup verification data on unmount or navigation away
  const cleanupVerification = useCallback(async () => {
    if (verificationData?.uuid && !submissionCompleteRef.current) {
      try {
        await onboardingVerificationsDestroy({
          path: { uuid: verificationData.uuid },
        });
      } catch {
        // Ignore errors during cleanup
      }
    }
  }, [verificationData, submissionComplete]);

  // Handle tab close or page refresh
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (verificationData?.uuid && !submissionComplete) {
        // Attempt cleanup (may not complete if tab closes immediately)
        cleanupVerification();
        // Show browser confirmation dialog
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [verificationData, submissionComplete, cleanupVerification]);

  // Handle navigation away from page
  useEffect(() => {
    const deregister = router.transitionService.onBefore(
      {},
      async (transition) => {
        // Don't cleanup if navigating to review status or if already completed
        if (
          verificationData?.uuid &&
          !submissionCompleteRef.current &&
          transition.to().name !== 'profile.verification-details'
        ) {
          try {
            await cleanupVerification();
          } catch {
            // Ignore errors during cleanup
          }
        }
      },
    );

    return () => {
      deregister();
    };
  }, [router, verificationData, cleanupVerification]);

  const handleStep2Submit = useCallback(
    async (formData) => {
      // Trigger auto-validation after person identifier input for automatic methods
      if (formData.validationMethod !== 'manual') {
        await runAutoValidation(formData);
      }
    },
    [runAutoValidation],
  );

  // Wrapper for Step 1 to fetch person identifier fields
  const Step1Wrapper: FC<any> = useCallback((props) => {
    return <OrganizationCreateStep1 {...props} />;
  }, []);

  // Wrapper for Step 2 to handle person identifier input
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
          isManual={isManual}
        />
      );
    },
    [validationResult, validationLoading, isManual],
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
    () => [Step1Wrapper, Step2Wrapper, Step3Wrapper, Step4Wrapper],
    [Step1Wrapper, Step2Wrapper, Step3Wrapper, Step4Wrapper],
  );

  const steps: ProgressStep[] = useMemo(
    () => [
      {
        key: 'method',
        label: translate('Method'),
        description: translate('Select verification method'),
        completed: false,
      },
      {
        key: 'identification',
        label: translate('Identification'),
        description: translate('Provide required identification details'),
        completed: false,
      },
      {
        key: 'result',
        label: translate('Result'),
        description: translate('Review results of validation'),
        completed: isManual,
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

    // Clean up verification object
    await cleanupVerification();

    router.stateService.go('profile.details');
  }, [dispatch, router, cleanupVerification]);

  const createOnboardingVerification = useCallback(
    async (formData, _dispatch, formProps) => {
      try {
        const isManualValidation = formData.validationMethod === 'manual';
        let validation = isManualValidation ? null : validationResult;

        if (isManualValidation) {
          validation = await handleManualVerification(
            formData,
            verificationData,
            getChecklistData,
          );
          // Store the verification to prevent duplicate creation on retry
          setVerificationData(validation);
        } else {
          await handleAutoIntentAnswers(formData, validation, getChecklistData);
        }

        await handleVerificationStatus(validation, formData, {
          onSuccess: () => {
            submissionCompleteRef.current = true;
            setSubmissionComplete(true);
            showSuccess(
              translate(
                'Organization created! You can view your submitted applications in your dashboard.',
              ),
            );
            formProps.destroy();
            router.stateService.go('profile.details');
          },
          onReview: (companyName) => {
            submissionCompleteRef.current = true;
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
      setVerificationData,
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
