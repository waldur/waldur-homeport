import { isEmpty } from '@/core/utils';

/**
 * True when a compliance answer counts as "answered".
 *
 * A boolean `false` ("No") and `0` are real answers — a naive `Boolean(value)`
 * check treated them as unanswered, which blocked submission for any proposal
 * needing a "No" answer. Only null/undefined/'' and empty objects/arrays are
 * unanswered. (typeof null === 'object', so null falls into the object branch
 * and isEmpty(null) === true → unanswered.)
 */
export const isComplianceAnswerFilled = (value: unknown): boolean =>
  typeof value === 'object'
    ? !isEmpty(value)
    : value !== undefined && value !== null && value !== '';

/**
 * Extract compliance answers from form data for API submission
 */
export const extractComplianceAnswers = (
  formData: Record<string, unknown>,
  checklistData?: {
    questions?: Array<{ uuid: string; question_type: string }>;
  },
): Array<{ question_uuid: string; answer_data: unknown }> => {
  const complianceAnswers: Array<{
    question_uuid: string;
    answer_data: unknown;
  }> = [];

  Object.keys(formData).forEach((key) => {
    if (key.startsWith('compliance_')) {
      const questionUuid = key.replace('compliance_', '');
      let answerData = formData[key];

      // Skip null/undefined/empty values - only submit actual answers
      if (
        answerData === null ||
        answerData === undefined ||
        answerData === ''
      ) {
        return;
      }

      // Format single_select answers as arrays for backend
      // Backend expects single_select as ["uuid"] not "uuid"
      if (answerData && typeof answerData === 'string') {
        // Check if this is a single_select question by finding it in checklistData
        const isSelectQuestion = checklistData?.questions?.some(
          (q) => q.uuid === questionUuid && q.question_type === 'single_select',
        );

        if (isSelectQuestion) {
          answerData = [answerData]; // Convert "uuid" to ["uuid"] for backend
        }
      }

      complianceAnswers.push({
        question_uuid: questionUuid,
        answer_data: answerData,
      });
    }
  });

  return complianceAnswers;
};
