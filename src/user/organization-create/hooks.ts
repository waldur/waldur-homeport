import { useCallback, useRef, useState } from 'react';
import {
  onboardingVerificationsRunValidation,
  onboardingVerificationsStartVerification,
  onboardingVerificationsSubmitAnswers,
  OnboardingVerification,
  OnboardingRunValidationRequestRequest,
} from 'waldur-js-client';

import { ENV } from '@waldur/core/config';
import { translate } from '@waldur/i18n';
import { useNotify } from '@waldur/store/hooks';

import {
  createAnswersFromFormData,
  createVerificationRequestBody,
} from './utils';

export const useChecklistCache = () => {
  const checklistCache = useRef<{
    allQuestions: any[];
    customerQuestions: any[];
    intentQuestions: any[];
    checklistUuid: string;
  } | null>(null);

  const getChecklistData = useCallback(async () => {
    if (checklistCache.current) {
      return checklistCache.current;
    }
    const country = ENV.plugins.WALDUR_CORE.ONBOARDING_COUNTRY;
    const { fetchChecklistWithMetadata } = await import('./utils');
    const data = await fetchChecklistWithMetadata(country);
    checklistCache.current = data;
    return data;
  }, []);

  return { getChecklistData };
};

export const useAutoValidation = (getChecklistData: () => Promise<any>) => {
  const { showSuccess, showErrorResponse } = useNotify();
  const [validationLoading, setValidationLoading] = useState(false);
  const [validationResult, setValidationResult] =
    useState<OnboardingVerification | null>(null);
  const [verificationData, setVerificationData] =
    useState<OnboardingVerification | null>(null);

  const runAutoValidation = useCallback(
    async (formData) => {
      const country = ENV.plugins.WALDUR_CORE.ONBOARDING_COUNTRY;
      setValidationLoading(true);

      try {
        // Step 1: Create verification instance
        const verificationResponse =
          await onboardingVerificationsStartVerification({
            body: createVerificationRequestBody(formData, country, false),
          });

        const verification = verificationResponse.data;
        setVerificationData(verification);

        // Step 2: Submit customer checklist answers
        const { customerQuestions } = await getChecklistData();

        if (customerQuestions.length > 0) {
          const answers = createAnswersFromFormData(
            customerQuestions,
            formData,
          );

          if (answers.length > 0) {
            await onboardingVerificationsSubmitAnswers({
              path: { uuid: verification.uuid },
              body: answers,
            });
          }
        }

        // Step 3: Run validation with user identification
        const isAustriaCountry = country === 'AT';
        const runValidationBody: OnboardingRunValidationRequestRequest = {};

        // ToDo: remove this workaround after implementing getting user's identifier via auth methods
        if (
          isAustriaCountry &&
          formData.temp_first_name &&
          formData.temp_last_name &&
          formData.temp_birth_date
        ) {
          runValidationBody.first_name = formData.temp_first_name;
          runValidationBody.last_name = formData.temp_last_name;
          runValidationBody.birth_date = formData.temp_birth_date;
        } else if (formData.temp_person_identifier) {
          runValidationBody.person_identifier = formData.temp_person_identifier;
        }

        const validationResponse = await onboardingVerificationsRunValidation({
          path: { uuid: verification.uuid },
          body: runValidationBody,
        });

        const validation = validationResponse.data;
        setValidationResult(validation);
        setVerificationData(validation);

        if (validation.status === 'verified') {
          showSuccess(translate('Company verification successful!'));
        }
      } catch (e) {
        showErrorResponse(e, translate('Unable to verify company.'));
      } finally {
        setValidationLoading(false);
      }
    },
    [showSuccess, showErrorResponse, getChecklistData],
  );

  return {
    validationLoading,
    validationResult,
    verificationData,
    setVerificationData,
    runAutoValidation,
  };
};
