import { isEqual } from 'es-toolkit';

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
 * Compare two answers by value, as the backend does. Select answers are
 * stored as arrays whose order means nothing, so they are compared as sets;
 * the form holds a single-select answer as a bare value, so it is wrapped.
 */
const valuesEqual = (a: unknown, b: unknown): boolean => {
  if (!Array.isArray(a) && !Array.isArray(b)) {
    return isEqual(a, b);
  }
  const left = Array.isArray(a) ? a : [a];
  const right = Array.isArray(b) ? b : [b];
  const has = (list: unknown[], value: unknown) =>
    list.some((item) => isEqual(item, value));
  return (
    left.every((value) => has(right, value)) &&
    right.every((value) => has(left, value))
  );
};

/**
 * Evaluate if a dependency condition is met based on current form values
 */
export const evaluateCondition = (
  condition: DependencyCondition,
  answerValue: unknown,
): boolean => {
  const { operator, required_value } = condition;

  // No answer means condition is not met (except for is_empty check); a
  // cleared multi-select is not sent to the backend, so it is no answer either
  if (
    (answerValue === undefined ||
      answerValue === null ||
      answerValue === '' ||
      (Array.isArray(answerValue) && answerValue.length === 0)) &&
    operator !== 'is_empty'
  ) {
    return false;
  }

  switch (operator) {
    case 'equals':
      return valuesEqual(answerValue, required_value);
    case 'not_equals':
      return !valuesEqual(answerValue, required_value);
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
      return valuesEqual(answerValue, required_value);
  }
};

/**
 * Evaluates if all dependencies are met for showing a question
 * @param depInfo - The dependency information from the question
 * @param questionDescToFieldName - Map of question descriptions to form field names
 * @param formValues - Current form values
 * @param isParentVisible - Whether the question a condition depends on is shown;
 *   a hidden question's answer meets no condition. Use getVisibleQuestions to
 *   check a whole checklist.
 * @returns true if the question should be visible, false otherwise
 */
export const evaluateQuestionVisibility = (
  depInfo: DependencyInfo | null | undefined,
  questionDescToFieldName: Record<string, string>,
  formValues: Record<string, any>,
  isParentVisible: (description: string) => boolean = () => true,
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
    return (
      evaluateCondition(condition, answerValue) &&
      isParentVisible(condition.question_description)
    );
  });

  // Apply logic operator
  return depInfo.logic === 'or'
    ? results.some(Boolean)
    : results.every(Boolean);
};

interface QuestionWithDependencies {
  description?: string | null;
  dependencies_info?: unknown;
}

/**
 * The questions shown for the current form values. Hiding a question also
 * hides those that depend on it, whatever answer it kept, as the backend does.
 */
export const getVisibleQuestions = <Q extends QuestionWithDependencies>(
  questions: Q[],
  questionDescToFieldName: Record<string, string>,
  formValues: Record<string, any>,
): Q[] => {
  const byDescription = new Map(questions.map((q) => [q.description, q]));
  const visible = new Map<Q, boolean>();
  const isVisible = (question: Q): boolean => {
    if (!visible.has(question)) {
      visible.set(question, false); // a dependency cycle hides its questions
      visible.set(
        question,
        evaluateQuestionVisibility(
          question.dependencies_info as DependencyInfo | null | undefined,
          questionDescToFieldName,
          formValues,
          (description) => {
            const parent = byDescription.get(description);
            return parent !== undefined && isVisible(parent);
          },
        ),
      );
    }
    return visible.get(question);
  };
  return questions.filter(isVisible);
};
