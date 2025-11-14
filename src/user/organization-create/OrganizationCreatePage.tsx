import { useRouter } from '@uirouter/react';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { formValueSelector } from 'redux-form';
import {
  onboardingJustificationsAttachDocument,
  onboardingJustificationsCreateJustification,
  onboardingVerificationsCreateCustomer,
  onboardingVerificationsRunValidation,
  onboardingVerificationsStartVerification,
  onboardingVerificationsSubmitAnswers,
  OnboardingVerification,
} from 'waldur-js-client';

import { formDataOptions } from '@waldur/core/api';
import { ENV } from '@waldur/core/config';
import { ProgressStep } from '@waldur/core/ProgressSteps';
import { SidebarLayout } from '@waldur/form/SidebarLayout';
import { WizardFormContainer } from '@waldur/form/WizardFormContainer';
import { translate } from '@waldur/i18n';
import { useNotify } from '@waldur/store/hooks';
import { useSetUser, useUser } from '@waldur/workspace/hooks';

import { ORGANIZATION_ONBOARDING_FORM_ID } from '../constants';

import { OrganizationCreateStep1 } from './OrganizationCreateStep1';
import { OrganizationCreateStep2 } from './OrganizationCreateStep2';
import { OrganizationCreateStep3 } from './OrganizationCreateStep3';
import { OrganizationCreateStep4 } from './OrganizationCreateStep4';
import { fetchChecklistWithMetadata } from './utils';

export const OrganizationCreatePage: FC = () => {
  const user = useUser();
  const setUser = useSetUser();
  const { showSuccess, showErrorResponse } = useNotify();
  const router = useRouter();

  const selector = formValueSelector(ORGANIZATION_ONBOARDING_FORM_ID);
  const addMethod =
    useSelector((state) => selector(state, 'addMethod')) || 'manual';
  const isManual = addMethod === 'manual';

  // Store verification result for later steps
  const [_verificationData, setVerificationData] =
    useState<OnboardingVerification | null>(null);

  // Create a wrapper for Step 3 that auto-advances when manual mode
  const Step3Wrapper: FC<any> = (props) => {
    const currentAddMethod = useSelector((state) =>
      selector(state, 'addMethod'),
    );

    // Auto-advance if manual mode
    useEffect(() => {
      if (currentAddMethod === 'manual' && props.onSubmit) {
        const timer = setTimeout(() => {
          props.onSubmit({}, null, {});
        }, 100);
        return () => clearTimeout(timer);
      }
    }, [currentAddMethod, props.onSubmit]);

    // If manual mode, return null to skip rendering
    if (currentAddMethod === 'manual') {
      return null;
    }

    return <OrganizationCreateStep3 {...props} />;
  };

  const wizardForms = useMemo(
    () => [
      OrganizationCreateStep1,
      OrganizationCreateStep2,
      Step3Wrapper,
      OrganizationCreateStep4,
    ],
    [Step3Wrapper],
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

  const createOnboardingVerification = useCallback(
    async (formData, _dispatch, formProps) => {
      try {
        const country = ENV.plugins.WALDUR_CORE.ONBOARDING_COUNTRY;
        const isManual = formData.addMethod === 'manual';

        // ToDo: remove this workaround after implementing getting user's identifier via auth methods
        const isAustriaCountry = country === 'AT';
        const requestBody: any = {
          country,
          legal_person_identifier: formData.registration_code,
          legal_name: formData.name,
          is_manual_validation: isManual,
        };

        // Add temporary user identification data if provided
        if (
          isAustriaCountry &&
          formData.temp_first_name &&
          formData.temp_last_name &&
          formData.temp_birth_date
        ) {
          requestBody.first_name = formData.temp_first_name;
          requestBody.last_name = formData.temp_last_name;
          requestBody.birth_date = formData.temp_birth_date;
        } else if (formData.temp_person_identifier) {
          requestBody.person_identifier = formData.temp_person_identifier;
        }

        // Step 1: Create verification instance
        const verificationResponse =
          await onboardingVerificationsStartVerification({
            body: requestBody,
          });

        const verification = verificationResponse.data;
        setVerificationData(verification);

        const { allQuestions } = await fetchChecklistWithMetadata(country);

        if (allQuestions.length > 0) {
          const answers = [];

          // Map form data to checklist answers using question_{uuid} field naming
          allQuestions.forEach((question) => {
            const fieldName = `question_${question.uuid}`;
            const fieldValue = formData[fieldName];

            if (
              fieldValue !== undefined &&
              fieldValue !== null &&
              fieldValue !== ''
            ) {
              if (question.question_type === 'multi_select') {
                if (Array.isArray(fieldValue) && fieldValue.length > 0) {
                  answers.push({
                    question_uuid: question.uuid,
                    answer_data: fieldValue, // [uuid1, uuid2, ...]
                  });
                }
              } else if (question.question_type === 'single_select') {
                if (fieldValue) {
                  answers.push({
                    question_uuid: question.uuid,
                    answer_data: [fieldValue], // [uuid]
                  });
                }
              } else {
                answers.push({
                  question_uuid: question.uuid,
                  answer_data: fieldValue,
                });
              }
            }
          });

          if (answers.length > 0) {
            await onboardingVerificationsSubmitAnswers({
              path: { uuid: verification.uuid },
              body: answers,
            });
          }
        }

        // Step 4: Run validation only if automatic method is chosen
        let validation = verification;
        if (!isManual) {
          const validationResponse = await onboardingVerificationsRunValidation(
            {
              path: { uuid: verification.uuid },
            },
          );
          validation = validationResponse.data;
          setVerificationData(validation);
          if (validation.status === 'verified') {
            showSuccess(translate('Company verification successful!'));
          }
        }

        // Step 5: Handle different verification statuses
        if (isManual || validation.status === 'escalated') {
          // For manual validation or escalated automatic validation, create justification
          const justificationResponse =
            await onboardingJustificationsCreateJustification({
              body: {
                verification_uuid: validation.uuid,
              },
            });

          const justification = justificationResponse.data;

          if (formData.uploadedFiles && formData.uploadedFiles.length > 0) {
            await Promise.all(
              formData.uploadedFiles.map((fileItem) =>
                onboardingJustificationsAttachDocument({
                  path: { uuid: justification.uuid },
                  body: { file: fileItem.file },
                  ...formDataOptions,
                }),
              ),
            );
          }

          showSuccess(
            translate(
              'Your request has been submitted for manual review. You will be notified once approved.',
            ),
          );

          formProps.destroy();
          router.stateService.go('profile.details');
        } else if (validation.status === 'verified') {
          // Auto-create customer if verified
          try {
            await onboardingVerificationsCreateCustomer({
              path: { uuid: validation.uuid },
            });
            showSuccess(translate('Organization created!'));
            formProps.destroy();
            router.stateService.go('profile.details');
          } catch (e) {
            showErrorResponse(e, translate('Unable to create organization.'));
          }
        } else if (validation.status === 'failed') {
          throw new Error(
            validation.error_message || translate('Company validation failed.'),
          );
        }
      } catch (e) {
        showErrorResponse(e, translate('Unable to verify company.'));
      }
    },
    [showSuccess, showErrorResponse, setUser, router, user],
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
        <WizardFormContainer
          form={ORGANIZATION_ONBOARDING_FORM_ID}
          title=""
          onSubmit={createOnboardingVerification}
          steps={steps}
          wizardForms={wizardForms}
          submitLabel={translate('Create')}
          nextLabel={translate('Next')}
          verticalLayout={true}
        />
      </div>
    </>
  );
};
