import {
  onboardingJustificationsAttachDocument,
  onboardingJustificationsCreateJustification,
  onboardingPersonIdentifierFieldsRetrieve,
  onboardingVerificationsAvailableChecklistsRetrieve,
  onboardingVerificationsCreateCustomer,
  onboardingVerificationsPartialUpdate,
  onboardingVerificationsStartVerification,
  onboardingVerificationsSubmitAnswers,
  OnboardingQuestionMetadata,
  OnboardingVerification,
  OnboardingCompanyValidationRequestRequest,
  QuestionAdmin,
  ValidationMethodEnum,
  BlankEnum,
} from 'waldur-js-client';

import { formDataOptions } from '@waldur/core/api';
import { translate } from '@waldur/i18n';

import { PersonIdentifierFieldConfig } from './PersonIdentifierFieldsRenderer';

export interface QuestionWithMetadata extends QuestionAdmin {
  onboarding_metadata?: OnboardingQuestionMetadata;
}

interface ChecklistQuestionsWithMetadata {
  allQuestions: QuestionWithMetadata[];
  customerQuestions: QuestionWithMetadata[];
  intentQuestions: QuestionWithMetadata[];
  checklistCustomerUuid: string;
  checklistIntentUuid: string;
}

/**
 * Fetches checklist questions with their onboarding metadata.
 * Uses the available_checklists endpoint which is accessible to regular users.
 *
 * @returns Object with all questions, customer questions, and intent questions
 */
export const fetchChecklistWithMetadata =
  async (): Promise<ChecklistQuestionsWithMetadata> => {
    try {
      // Fetch checklists from the available_checklists endpoint
      const response =
        await onboardingVerificationsAvailableChecklistsRetrieve();

      const customerChecklist = response.data.customer_checklist as any;
      const intentChecklist = response.data.intent_checklist as any;

      const checklistCustomerUuid = (customerChecklist?.uuid as string) || '';
      const checklistIntentUuid = (intentChecklist?.uuid as string) || '';

      // Extract questions with metadata already included
      const customerQuestions: QuestionWithMetadata[] = (
        customerChecklist?.questions || []
      ).map((q: any) => ({
        ...q,
        onboarding_metadata: q.onboarding_metadata,
      }));

      const intentQuestions: QuestionWithMetadata[] = (
        intentChecklist?.questions || []
      ).map((q: any) => ({
        ...q,
        onboarding_metadata: q.onboarding_metadata,
      }));

      const allQuestions = [...customerQuestions, ...intentQuestions];

      return {
        allQuestions,
        customerQuestions,
        intentQuestions,
        checklistCustomerUuid,
        checklistIntentUuid,
      };
    } catch {
      return {
        allQuestions: [],
        customerQuestions: [],
        intentQuestions: [],
        checklistCustomerUuid: '',
        checklistIntentUuid: '',
      };
    }
  };

/**
 * Fetches person identifier field specifications for a validation method.
 * @param validationMethod - The validation method identifier (e.g., 'ariregister', 'wirtschaftscompass')
 * @returns Person identifier field configuration
 */
export const fetchPersonIdentifierFields = async (
  validationMethod: ValidationMethodEnum | BlankEnum,
): Promise<PersonIdentifierFieldConfig | null> => {
  if (!validationMethod) {
    return null;
  }

  try {
    const response = await onboardingPersonIdentifierFieldsRetrieve({
      query: {
        validation_method: validationMethod,
      },
    });

    // Validate response has required fields
    if (!response.data || !response.data.person_identifier_fields) {
      return null;
    }

    return response.data as PersonIdentifierFieldConfig;
  } catch (error: any) {
    // Backend returns 404 if fields are not configured
    // Backend returns 400 if validation_method is missing
    if (error?.status === 404 || error?.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

export const createAnswersFromFormData = (questions: any[], formData: any) => {
  const answers = [];

  questions.forEach((question) => {
    const fieldName = `question_${question.uuid}`;
    const fieldValue = formData[fieldName];

    if (fieldValue !== undefined && fieldValue !== null && fieldValue !== '') {
      if (question.question_type === 'multi_select') {
        if (Array.isArray(fieldValue) && fieldValue.length > 0) {
          answers.push({
            question_uuid: question.uuid,
            answer_data: fieldValue,
          });
        }
      } else if (question.question_type === 'single_select') {
        if (fieldValue) {
          answers.push({
            question_uuid: question.uuid,
            answer_data: [fieldValue],
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

  return answers;
};

export const createVerificationRequestBody = (
  formData: any,
  validationMethod: ValidationMethodEnum | BlankEnum,
): OnboardingCompanyValidationRequestRequest => {
  return {
    validation_method: validationMethod,
    legal_person_identifier: formData.registration_code,
    legal_name: formData.name,
  };
};

export const handleManualVerification = async (
  formData: any,
  verificationData: OnboardingVerification | null,
  getChecklistData: () => Promise<any>,
) => {
  let validation: OnboardingVerification;

  if (verificationData) {
    // Reuse existing verification (either escalated or already created)
    validation = verificationData;

    // Update legal_name and registration code in case user changed them
    await onboardingVerificationsPartialUpdate({
      path: { uuid: validation.uuid },
      body: {
        legal_name: formData.name,
        legal_person_identifier: formData.registration_code,
      },
    });

    // Submit checklist answers for the existing verification
    const { customerQuestions, intentQuestions } = await getChecklistData();

    // Combine all answers and submit together
    const allQuestions = [...customerQuestions, ...intentQuestions];
    if (allQuestions.length > 0) {
      const allAnswers = createAnswersFromFormData(allQuestions, formData);
      if (allAnswers.length > 0) {
        await onboardingVerificationsSubmitAnswers({
          path: { uuid: validation.uuid },
          body: allAnswers,
        });
      }
    }
  } else {
    // Create new verification instance for pure manual flow
    const verificationResponse = await onboardingVerificationsStartVerification(
      {
        body: createVerificationRequestBody(formData, ''),
      },
    );

    validation = verificationResponse.data;

    const { customerQuestions, intentQuestions } = await getChecklistData();

    // Combine all answers and submit together
    const allQuestions = [...customerQuestions, ...intentQuestions];
    if (allQuestions.length > 0) {
      const allAnswers = createAnswersFromFormData(allQuestions, formData);
      if (allAnswers.length > 0) {
        await onboardingVerificationsSubmitAnswers({
          path: { uuid: validation.uuid },
          body: allAnswers,
        });
      }
    }
  }

  return validation;
};

export const handleAutoIntentAnswers = async (
  formData: any,
  verification: OnboardingVerification,
  getChecklistData: () => Promise<any>,
) => {
  const { intentQuestions } = await getChecklistData();

  if (intentQuestions.length > 0) {
    const intentAnswers = createAnswersFromFormData(intentQuestions, formData);

    if (intentAnswers.length > 0) {
      await onboardingVerificationsSubmitAnswers({
        path: { uuid: verification.uuid },
        body: intentAnswers,
      });
    }
  }
};

export const handleVerificationStatus = async (
  validation: OnboardingVerification,
  formData: any,
  callbacks: {
    onSuccess: () => void;
    onReview: (companyName: string) => void;
    onError: (error: any) => void;
  },
) => {
  const isManual = formData.validationMethod === 'manual';

  if (isManual || validation.status === 'escalated') {
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

    callbacks.onReview(formData.name || '');
  } else if (validation.status === 'verified') {
    try {
      await onboardingVerificationsCreateCustomer({
        path: { uuid: validation.uuid },
      });
      callbacks.onSuccess();
    } catch (e) {
      callbacks.onError(e);
    }
  } else if (validation.status === 'failed') {
    throw new Error(
      validation.error_message || translate('Company validation failed.'),
    );
  }
};
