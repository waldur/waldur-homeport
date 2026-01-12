import {
  checklistsAdminList,
  checklistsAdminQuestionsList,
  onboardingJustificationsAttachDocument,
  onboardingJustificationsCreateJustification,
  onboardingQuestionMetadataList,
  onboardingVerificationsCreateCustomer,
  onboardingVerificationsPartialUpdate,
  onboardingVerificationsStartVerification,
  onboardingVerificationsSubmitAnswers,
  OnboardingCompanyValidationRequestRequest,
  OnboardingQuestionMetadata,
  OnboardingVerification,
  QuestionAdmin,
} from 'waldur-js-client';

import { formDataOptions } from '@waldur/core/api';
import { ENV } from '@waldur/core/config';
import { translate } from '@waldur/i18n';

export interface QuestionWithMetadata extends QuestionAdmin {
  onboarding_metadata?: OnboardingQuestionMetadata;
}

interface ChecklistQuestionsWithMetadata {
  allQuestions: QuestionWithMetadata[];
  customerQuestions: QuestionWithMetadata[];
  intentQuestions: QuestionWithMetadata[];
  checklistUuid: string;
}

/**
 * Fetches checklist questions with their onboarding metadata and separates them
 * into customer fields and intent fields.
 *
 * The backend now expects two portal-wide checklists:
 * - `onboarding_customer` for customer data questions
 * - `onboarding_intent` for intent/purpose questions
 *
 * @returns Object with all questions, customer questions, and intent questions
 */
export const fetchChecklistWithMetadata =
  async (): Promise<ChecklistQuestionsWithMetadata> => {
    // Fetch both portal-wide onboarding checklists
    const [customerResponse, intentResponse] = await Promise.all([
      checklistsAdminList({
        query: { checklist_type: 'onboarding_customer' },
      }),
      checklistsAdminList({ query: { checklist_type: 'onboarding_intent' } }),
    ]);

    const customerChecklist = customerResponse.data[0];
    const intentChecklist = intentResponse.data[0];

    if (!customerChecklist && !intentChecklist) {
      return {
        allQuestions: [],
        customerQuestions: [],
        intentQuestions: [],
        checklistUuid: '',
      };
    }

    // Fetch questions for each checklist
    const [customerQuestionsResponse, intentQuestionsResponse] =
      await Promise.all([
        customerChecklist
          ? checklistsAdminQuestionsList({
              query: { checklist_uuid: customerChecklist.uuid },
            })
          : Promise.resolve({ data: [] }),
        intentChecklist
          ? checklistsAdminQuestionsList({
              query: { checklist_uuid: intentChecklist.uuid },
            })
          : Promise.resolve({ data: [] }),
      ]);

    const customerQuestionsList =
      (customerQuestionsResponse.data as QuestionAdmin[]) || [];
    const intentQuestionsList =
      (intentQuestionsResponse.data as QuestionAdmin[]) || [];

    // Fetch metadata for questions from both checklists
    const checklistUuids = [customerChecklist?.uuid, intentChecklist?.uuid]
      .filter(Boolean)
      .join(',');

    const metadataResponse = checklistUuids
      ? await onboardingQuestionMetadataList({
          query: { checklist_uuid: checklistUuids },
        })
      : { data: [] };

    const metadataList = metadataResponse.data || [];

    // Map questions with metadata
    const mapWithMetadata = (
      questions: QuestionAdmin[],
    ): QuestionWithMetadata[] =>
      questions.map((question) => {
        const metadata = metadataList.find(
          (m) => m.question_uuid === question.uuid,
        );
        return {
          ...question,
          onboarding_metadata: metadata,
        };
      });

    const customerQuestionsWithMetadata = mapWithMetadata(
      customerQuestionsList,
    );
    const intentQuestionsWithMetadata = mapWithMetadata(intentQuestionsList);

    return {
      allQuestions: [
        ...customerQuestionsWithMetadata,
        ...intentQuestionsWithMetadata,
      ],
      customerQuestions: customerQuestionsWithMetadata,
      intentQuestions: intentQuestionsWithMetadata,
      checklistUuid: customerChecklist?.uuid || intentChecklist?.uuid || '',
    };
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
  country: string,
): OnboardingCompanyValidationRequestRequest => {
  return {
    country,
    legal_person_identifier: formData.registration_code,
    legal_name: formData.name,
  };
};

export const handleManualVerification = async (
  formData: any,
  verificationData: OnboardingVerification | null,
  getChecklistData: () => Promise<any>,
) => {
  const countries = ENV.plugins.WALDUR_CORE.ONBOARDING_SUPPORTED_COUNTRIES;
  const country = countries?.[0] || '';
  let validation: OnboardingVerification;

  if (verificationData && verificationData.status === 'escalated') {
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
    const { allQuestions } = await getChecklistData();

    if (allQuestions.length > 0) {
      const answers = createAnswersFromFormData(allQuestions, formData);

      if (answers.length > 0) {
        await onboardingVerificationsSubmitAnswers({
          path: { uuid: validation.uuid },
          body: answers,
        });
      }
    }
  } else {
    // Create new verification instance for pure manual flow
    const verificationResponse = await onboardingVerificationsStartVerification(
      {
        body: createVerificationRequestBody(formData, country),
      },
    );

    validation = verificationResponse.data;

    const { allQuestions } = await getChecklistData();

    if (allQuestions.length > 0) {
      const answers = createAnswersFromFormData(allQuestions, formData);

      if (answers.length > 0) {
        await onboardingVerificationsSubmitAnswers({
          path: { uuid: validation.uuid },
          body: answers,
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
  const isManual = formData.addMethod === 'manual';

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
