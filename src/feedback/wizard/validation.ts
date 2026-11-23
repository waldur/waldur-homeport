import { pickBy } from 'es-toolkit';

import { composeValidators, greaterThan, required } from '@/core/validators';
import { translate } from '@/i18n';

import { duplicateDescriptions } from './localQuestions';
import { LocalQuestion, SurveyWizardValues } from './types';

export const positive = composeValidators(required, greaterThan(0));

// The server refuses a text of only spaces as blank.
export const requiredText = (value: unknown) =>
  required(typeof value === 'string' ? value.trim() : value);

const endsAfterStart = (value, allValues) =>
  value &&
  allValues?.starts_at &&
  new Date(value).getTime() <= new Date(allValues.starts_at).getTime()
    ? translate('End must be after start.')
    : undefined;

export const validateEndsAt = composeValidators(required, endsAfterStart);

// The server caps the questions a survey can carry.
export const MAX_SURVEY_QUESTIONS = 100;

export const validateAudience = (values) =>
  values.all_users || values.customers?.length || values.offerings?.length
    ? {}
    : {
        customers: translate('Choose all users, organizations or offerings.'),
      };

// The audience error sits on a field that shows it only once touched, so the
// button names it too.
export const getDisabledReason = (errors: Record<string, string>) =>
  [
    Object.keys(errors).some((name) => name !== 'customers') &&
      translate('Fill in the required fields.'),
    errors.customers,
  ]
    .filter(Boolean)
    .join(' ');

export const getQuestionsReason = (questions: LocalQuestion[]) =>
  !questions.length
    ? translate('Add at least one question.')
    : questions.length > MAX_SURVEY_QUESTIONS
      ? translate('A survey can have at most {count} questions.', {
          count: MAX_SURVEY_QUESTIONS,
        })
      : duplicateDescriptions(questions).length
        ? translate('Each question needs its own text.')
        : undefined;

// Each step's checks live only while it is shown, and the step bar jumps back
// to a visited step past them, so the final submit checks the whole survey.
export const getSubmitReason = (
  values: SurveyWizardValues,
  locked: boolean,
): string | undefined => {
  const errors = pickBy(
    {
      name: requiredText(values.name),
      starts_at: required(values.starts_at),
      ends_at: validateEndsAt(values.ends_at, values),
      max_prompts: positive(values.max_prompts),
      snooze_days: positive(values.snooze_days),
      ...validateAudience(values),
    },
    Boolean,
  );
  return (
    [
      getDisabledReason(errors),
      // A locked survey keeps its questions as they are.
      !locked && getQuestionsReason(values.questions ?? []),
    ]
      .filter(Boolean)
      .join(' ') || undefined
  );
};
