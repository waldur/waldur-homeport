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
