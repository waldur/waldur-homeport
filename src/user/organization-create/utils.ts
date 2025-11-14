import {
  onboardingCountryConfigsList,
  onboardingQuestionMetadataList,
  OnboardingQuestionMetadata,
  QuestionAdmin,
} from 'waldur-js-client';

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
 * into customer fields (maps_to_customer_field) and intent fields (intent_field).
 *
 * @param country - ISO country code (e.g., 'EE' for Estonia)
 * @returns Object with all questions, customer questions, and intent questions
 */
export const fetchChecklistWithMetadata = async (
  country: string,
): Promise<ChecklistQuestionsWithMetadata> => {
  const configResponse = await onboardingCountryConfigsList({
    query: { country },
  });

  const config = configResponse.data[0];
  if (!config) {
    return {
      allQuestions: [],
      customerQuestions: [],
      intentQuestions: [],
      checklistUuid: '',
    };
  }

  const checklistUuid = config.checklist_uuid;

  const questions = (config.questions as QuestionAdmin[]) || [];

  const metadataResponse = await onboardingQuestionMetadataList({
    query: { checklist_uuid: checklistUuid },
  });

  const metadataList = metadataResponse.data || [];

  const questionsWithMetadata: QuestionWithMetadata[] = questions.map(
    (question) => {
      const metadata = metadataList.find(
        (m) => m.question_uuid === question.uuid,
      );
      return {
        ...question,
        onboarding_metadata: metadata,
      };
    },
  );

  const customerQuestions = questionsWithMetadata.filter(
    (q) => q.onboarding_metadata?.maps_to_customer_field,
  );

  const intentQuestions = questionsWithMetadata.filter(
    (q) => q.onboarding_metadata?.intent_field,
  );

  return {
    allQuestions: questionsWithMetadata,
    customerQuestions,
    intentQuestions,
    checklistUuid,
  };
};
