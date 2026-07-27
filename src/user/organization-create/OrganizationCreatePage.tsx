import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';
import { useRouter } from '@uirouter/react';
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Form, FormSpy } from 'react-final-form';
import { onboardingVerificationsDestroy } from 'waldur-js-client';

import { LoadingSpinnerSimple } from '@/core/LoadingSpinner';
import { SubmitButton } from '@/form';
import { SidebarLayout } from '@/form/SidebarLayout';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { useNotify } from '@/store/notify';
import { ProgressStep, VerticalProgressSteps } from '@/wizard';

import { useAutoValidation, useChecklistCache } from './hooks';
import { OrganizationCreateStep1 } from './OrganizationCreateStep1';
import { OrganizationCreateStep2 } from './OrganizationCreateStep2';
import { OrganizationCreateStep3 } from './OrganizationCreateStep3';
import { OrganizationCreateStep4 } from './OrganizationCreateStep4';
import { OrganizationReviewStatus } from './OrganizationReviewStatus';
import { OrganizationCreateFormValues } from './types';
import {
  handleAutoIntentAnswers,
  handleManualVerification,
  handleVerificationStatus,
} from './utils';

import '@/wizard/wizard.scss';

export const OrganizationCreatePage: FC = () => {
  const { confirm } = useModal();

  const router = useRouter();
  const { showSuccess, showErrorResponse } = useNotify();

  const [step, setStep] = useState(0);
  const [lastVisitedStep, setLastVisitedStep] = useState(0);
  const [submitDisabled, setSubmitDisabled] = useState(false);
  const [submitDisabledReason, setSubmitDisabledReason] = useState('');
  const [validationMethod, setValidationMethod] = useState<string>('');

  // A step (Step 2's incomplete-profile gate, Step 3's escalation) can disable
  // the footer's Next/Create button; the reason surfaces as its tooltip so a
  // disabled control always explains why (see ui-consistency guideline 2.2).
  const handleSubmitDisabledChange = useCallback(
    (disabled: boolean, reason?: string) => {
      setSubmitDisabled(disabled);
      setSubmitDisabledReason(disabled ? reason || '' : '');
    },
    [],
  );

  const isManual = validationMethod === 'manual';
  const skipSteps = useMemo(() => (isManual ? [2] : []), [isManual]);
  const totalSteps = 4;

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

  // Step navigation
  const nextStep = useCallback(() => {
    let nextStepIndex = step + 1;
    while (skipSteps.includes(nextStepIndex) && nextStepIndex < totalSteps) {
      nextStepIndex++;
    }
    setStep(nextStepIndex);
    if (nextStepIndex > lastVisitedStep) {
      setLastVisitedStep(nextStepIndex);
    }
  }, [step, skipSteps, lastVisitedStep]);

  const prevStep = useCallback(() => {
    // Clear any step-scoped block (e.g. Step 2's incomplete-profile gate) so it
    // doesn't leak onto an earlier step that has nothing to disable.
    setSubmitDisabled(false);
    setSubmitDisabledReason('');
    let prevStepIndex = step - 1;
    while (skipSteps.includes(prevStepIndex) && prevStepIndex >= 0) {
      prevStepIndex--;
    }
    setStep(Math.max(0, prevStepIndex));
  }, [step, skipSteps]);

  const selectStep = useCallback(
    (num: number) => {
      if (num <= lastVisitedStep && !skipSteps.includes(num)) setStep(num);
    },
    [lastVisitedStep, skipSteps],
  );

  const isLast = step === totalSteps - 1;

  const handleStep2Submit = useCallback(
    async (formData: OrganizationCreateFormValues) => {
      // Trigger auto-validation after person identifier input for automatic methods
      if (formData.validationMethod !== 'manual') {
        await runAutoValidation(formData);
      }
    },
    [runAutoValidation],
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

  const stepsWithCompletion = steps.map((s, i) => ({
    ...s,
    completed: i < step,
  }));

  const handleStepClick = (_step: ProgressStep, index: number) => {
    if (submitDisabled) return;
    if (index <= lastVisitedStep && !skipSteps.includes(index)) {
      selectStep(index);
    }
  };

  const handleCancel = useCallback(async () => {
    await confirm(
      translate('Cancel organization creation'),
      translate(
        'Are you sure you want to cancel? All entered data will be lost.',
      ),
    );

    // Clean up verification object
    await cleanupVerification();

    router.stateService.go('profile.details');
  }, [router, cleanupVerification]);

  const createOnboardingVerification = useCallback(
    async (formData: OrganizationCreateFormValues) => {
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

  const handleFormSubmit = useCallback(
    async (values: OrganizationCreateFormValues) => {
      if (isLast) {
        await createOnboardingVerification(values);
      } else {
        // For step 2 (identification), run auto-validation before advancing
        if (step === 1) {
          await handleStep2Submit(values);
        }
        nextStep();
      }
    },
    [isLast, step, createOnboardingVerification, handleStep2Submit, nextStep],
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
                steps={steps.map((s) => ({ ...s, completed: true }))}
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
          <Form<OrganizationCreateFormValues>
            onSubmit={handleFormSubmit}
            render={({ handleSubmit, submitting }) => (
              <form className="wizard wizard-vertical" onSubmit={handleSubmit}>
                {/* Track validationMethod changes */}
                <FormSpy<OrganizationCreateFormValues>
                  subscription={{ values: true }}
                  onChange={(formState) => {
                    const vm = formState.values?.validationMethod || '';
                    if (vm !== validationMethod) {
                      setValidationMethod(vm);
                    }
                  }}
                />

                <div className="d-flex gap-7">
                  {/* Left Sidebar with Stepper */}
                  <div className="flex-shrink-0" style={{ width: '300px' }}>
                    <VerticalProgressSteps
                      steps={stepsWithCompletion}
                      onClick={handleStepClick}
                    />
                  </div>

                  {/* Main Content */}
                  <div className="flex-grow-1">
                    <div className="wizard-body-vertical">
                      {step === 0 && <OrganizationCreateStep1 />}
                      {step === 1 && (
                        <OrganizationCreateStep2
                          getChecklistData={getChecklistData}
                          onSubmitDisabledChange={handleSubmitDisabledChange}
                        />
                      )}
                      {step === 2 && (
                        <OrganizationCreateStep3
                          validationResult={validationResult}
                          validationLoading={validationLoading}
                          isManual={isManual}
                          onSubmitDisabledChange={handleSubmitDisabledChange}
                        />
                      )}
                      {step === 3 && (
                        <OrganizationCreateStep4
                          getChecklistData={getChecklistData}
                        />
                      )}
                    </div>

                    {/* Footer buttons */}
                    <div className="d-flex justify-content-between mt-5 pt-5 border-top">
                      <SubmitButton
                        submitting={false}
                        variant="secondary"
                        onClick={prevStep}
                        disabled={step === 0}
                        className="min-w-125px"
                        type="button"
                        label={translate('Back')}
                        iconNode={<CaretLeftIcon weight="bold" />}
                        iconOnLeft
                      />
                      <div className="d-flex gap-3">
                        <SubmitButton
                          submitting={false}
                          variant="tertiary"
                          className="min-w-125px"
                          onClick={handleCancel}
                          type="button"
                          label={translate('Cancel')}
                        />
                        <SubmitButton
                          submitting={submitting}
                          label={
                            isLast ? translate('Create') : translate('Next')
                          }
                          invalid={submitDisabled}
                          disabledReason={submitDisabledReason || undefined}
                          className="btn-icon-right min-w-125px"
                          children={
                            submitting ? (
                              <span className="svg-icon svg-icon-2">
                                {}
                                <LoadingSpinnerSimple />
                              </span>
                            ) : !isLast ? (
                              <span className="svg-icon svg-icon-2">
                                <CaretRightIcon weight="bold" />
                              </span>
                            ) : null
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            )}
          />
        )}
      </div>
    </>
  );
};
