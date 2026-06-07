import { useCallback, useRef, useState } from 'react';
import {
  onboardingVerificationsRunValidation,
  onboardingVerificationsStartVerification,
  onboardingVerificationsSubmitAnswers,
  OnboardingVerification,
  OnboardingRunValidationRequestRequest,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { useNotify } from '@/store/notify';

import {
  createAnswersFromFormData,
  createVerificationRequestBody,
  fetchChecklistWithMetadata,
} from './utils';

// `./utils` is already a hard static dep of OrganizationCreatePage,
// OrganizationCreateStep1, etc. — the previous `await import('./utils')`
// did not split anything into a separate chunk (Rolldown's
// INEFFECTIVE_DYNAMIC_IMPORT warning called this out). Importing
// `fetchChecklistWithMetadata` statically is cheaper at runtime than
// the async import resolve.
export const useChecklistCache = () => {
  const checklistCache = useRef<{
    allQuestions: any[];
    customerQuestions: any[];
    intentQuestions: any[];
    checklistCustomerUuid: string;
    checklistIntentUuid: string;
  } | null>(null);

  const getChecklistData = useCallback(async () => {
    if (checklistCache.current) {
      return checklistCache.current;
    }
    const data = await fetchChecklistWithMetadata();
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
      setValidationLoading(true);

      try {
        // Step 1: Create verification instance with validation_method
        const verificationResponse =
          await onboardingVerificationsStartVerification({
            body: createVerificationRequestBody(
              formData,
              formData.validationMethod,
            ),
          });

        const verification = verificationResponse.data;
        setVerificationData(verification);

        // Step 2: Submit INTENT checklist answers (automatic validation only requires intent questions)
        const { intentQuestions } = await getChecklistData();

        if (intentQuestions.length > 0) {
          const intentAnswers = createAnswersFromFormData(
            intentQuestions,
            formData,
          );

          if (intentAnswers.length > 0) {
            await onboardingVerificationsSubmitAnswers({
              path: { uuid: verification.uuid },
              body: intentAnswers,
            });
          }
        }

        // Step 3: Run validation with user identification
        const runValidationBody: OnboardingRunValidationRequestRequest = {};

        // Extract person identifier fields dynamically from form data
        // Fields are prefixed with 'person_identifier_' by PersonIdentifierFieldsRenderer
        Object.keys(formData).forEach((key) => {
          if (key.startsWith('person_identifier_')) {
            const fieldName = key.replace('person_identifier_', '');
            runValidationBody[fieldName] = formData[key];
          }
        });

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
