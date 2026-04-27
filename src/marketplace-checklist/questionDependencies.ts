import { isEmpty } from '@/core/utils';

export interface DependencyCondition {
  question_description: string;
  operator: string;
  required_value: unknown;
}

export interface DependencyInfo {
  logic: 'and' | 'or';
  conditions: DependencyCondition[];
}

/**
 * Evaluate if a dependency condition is met based on current form values
 */
export const evaluateCondition = (
  condition: DependencyCondition,
  answerValue: unknown,
): boolean => {
  const { operator, required_value } = condition;

  // No answer means condition is not met (except for is_empty check)
  if (
    (answerValue === undefined || answerValue === null || answerValue === '') &&
    operator !== 'is_empty'
  ) {
    return false;
  }

  switch (operator) {
    case 'equals':
      return answerValue === required_value;
    case 'not_equals':
      return answerValue !== required_value;
    case 'in':
      // Check if answerValue contains any of the values in required_value array
      if (Array.isArray(required_value)) {
        if (Array.isArray(answerValue)) {
          // Multi-select: check if any selected value is in the required values
          return answerValue.some((val) => required_value.includes(val));
        } else {
          // Single value: check if it's in the required values
          return required_value.includes(answerValue);
        }
      }
      return false;
    case 'not_in':
      // Check if answerValue does not contain any of the values in required_value array
      if (Array.isArray(required_value)) {
        if (Array.isArray(answerValue)) {
          return !answerValue.some((val) => required_value.includes(val));
        } else {
          return !required_value.includes(answerValue);
        }
      }
      return true;
    case 'contains':
      if (Array.isArray(answerValue)) {
        return answerValue.includes(required_value);
      }
      return String(answerValue).includes(String(required_value));
    case 'not_contains':
      if (Array.isArray(answerValue)) {
        return !answerValue.includes(required_value);
      }
      return !String(answerValue).includes(String(required_value));
    case 'greater_than':
      return Number(answerValue) > Number(required_value);
    case 'less_than':
      return Number(answerValue) < Number(required_value);
    case 'is_empty':
      return isEmpty(answerValue);
    case 'is_not_empty':
      return !isEmpty(answerValue);
    default:
      return answerValue === required_value;
  }
};

/**
 * Evaluates if all dependencies are met for showing a question
 * @param depInfo - The dependency information from the question
 * @param questionDescToFieldName - Map of question descriptions to form field names
 * @param formValues - Current form values
 * @returns true if the question should be visible, false otherwise
 */
export const evaluateQuestionVisibility = (
  depInfo: DependencyInfo | null | undefined,
  questionDescToFieldName: Record<string, string>,
  formValues: Record<string, any>,
): boolean => {
  // No dependencies = always visible
  if (!depInfo || !depInfo.conditions?.length) {
    return true;
  }

  const results = depInfo.conditions.map((condition) => {
    // Find the parent question's form value by description
    const parentFieldName =
      questionDescToFieldName[condition.question_description];
    const answerValue = parentFieldName
      ? formValues[parentFieldName]
      : undefined;
    return evaluateCondition(condition, answerValue);
  });

  // Apply logic operator
  return depInfo.logic === 'or'
    ? results.some(Boolean)
    : results.every(Boolean);
};
