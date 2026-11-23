import {
  SurveyQuestion,
  SurveyQuestionRequest,
  SurveyQuestionTypeEnum,
} from 'waldur-js-client';

import { randomUUID } from '@/core/utils';
import { ChecklistQuestionForm } from '@/marketplace-checklist/types';
import {
  isQuestionSelectType,
  questionTypeOptions,
  RANGE_QUESTION_TYPES,
} from '@/marketplace-checklist/utils';

import { LocalQuestion, VisibilityQuestion } from './types';

const newKey = (): string => randomUUID();

const blankToNull = <T>(value: T | '' | undefined): T | null =>
  value === undefined || value === '' ? null : value;

export const toQuestionFormValues = (
  question: LocalQuestion,
): ChecklistQuestionForm => ({
  description: question.description,
  user_guidance: question.user_guidance,
  question_type: question.question_type,
  required: question.required,
  min_value: question.min_value ?? undefined,
  max_value: question.max_value ?? undefined,
  likert_scale_length: question.likert_scale_length ?? undefined,
  likert_low_label: question.likert_low_label,
  likert_high_label: question.likert_high_label,
  likert_allow_na: question.likert_allow_na,
  rich_text_char_limit:
    question.rich_text_char_limit === null
      ? undefined
      : String(question.rich_text_char_limit),
  rich_text_toolbar_level: question.rich_text_toolbar_level,
  dependency_logic_operator: question.dependency_logic_operator,
  options: question.options.map((option) => option.label),
  option_keys: question.options.map((option) => option.key),
  conditions: question.conditions.map((condition) => ({
    depends_on_question: condition.depends_on,
    operator: condition.operator,
    required_answer_value: condition.required_answer_value,
  })),
});

// Fields of other types are reset, as the API dialog leaves them out of the
// request, so a question switched from likert to text carries no likert labels.
export const fromQuestionFormValues = (
  values: ChecklistQuestionForm,
  previous?: LocalQuestion,
): LocalQuestion => {
  const type = values.question_type;
  const isRange = RANGE_QUESTION_TYPES.includes(type);
  const isLikert = type === 'likert';
  const isRichText = type === 'rich_text';
  return {
    key: previous?.key ?? newKey(),
    description: values.description,
    question_type: type,
    required: Boolean(values.required),
    user_guidance: values.user_guidance ?? '',
    min_value: isRange ? blankToNull(values.min_value) : null,
    max_value: isRange ? blankToNull(values.max_value) : null,
    likert_scale_length: isLikert ? (values.likert_scale_length ?? 5) : null,
    likert_low_label: isLikert ? (values.likert_low_label ?? '') : '',
    likert_high_label: isLikert ? (values.likert_high_label ?? '') : '',
    likert_allow_na: isLikert && Boolean(values.likert_allow_na),
    rich_text_char_limit:
      isRichText && values.rich_text_char_limit
        ? Number(values.rich_text_char_limit)
        : null,
    rich_text_toolbar_level:
      (isRichText && values.rich_text_toolbar_level) || 'standard',
    // The radio sets its default only once the Visibility tab is opened.
    dependency_logic_operator: values.dependency_logic_operator ?? 'and',
    // A key the form has none for is a new option's.
    options: isQuestionSelectType(type)
      ? (values.options ?? []).map((label, index) => ({
          key: values.option_keys?.[index] ?? newKey(),
          label,
        }))
      : [],
    conditions: (values.conditions ?? []).map((condition) => ({
      depends_on: condition.depends_on_question,
      operator: condition.operator,
      required_answer_value: condition.required_answer_value,
    })),
  };
};

// The question itself and every question shown depending on it, directly or
// through others: making it depend on one of them would form a cycle.
const withDependants = (questions: LocalQuestion[], key: string) => {
  const found = new Set([key]);
  let grew = true;
  while (grew) {
    grew = false;
    for (const question of questions) {
      if (
        !found.has(question.key) &&
        question.conditions.some((condition) => found.has(condition.depends_on))
      ) {
        found.add(question.key);
        grew = true;
      }
    }
  }
  return found;
};

export const toVisibilityQuestions = (
  questions: LocalQuestion[],
  excludeKey?: string,
): VisibilityQuestion[] => {
  const excluded = excludeKey
    ? withDependants(questions, excludeKey)
    : new Set<string>();
  return questions
    .filter((question) => !excluded.has(question.key))
    .map((question) => ({
      uuid: question.key,
      url: question.key,
      description: question.description,
      question_type: question.question_type,
      question_options: question.options.map((option) => ({
        uuid: option.key,
        label: option.label,
      })),
    }));
};

// Defaults for the fields the API leaves out of a question of another type,
// the same ones fromQuestionFormValues resets them to.
export const fromSurveyQuestion = (
  question: SurveyQuestion,
): LocalQuestion => ({
  key: question.key,
  description: question.description,
  question_type: question.question_type,
  required: question.required ?? false,
  user_guidance: question.user_guidance ?? '',
  min_value: question.min_value ?? null,
  max_value: question.max_value ?? null,
  likert_scale_length: question.likert_scale_length ?? null,
  likert_low_label: question.likert_low_label ?? '',
  likert_high_label: question.likert_high_label ?? '',
  likert_allow_na: question.likert_allow_na ?? false,
  rich_text_char_limit: question.rich_text_char_limit ?? null,
  rich_text_toolbar_level: question.rich_text_toolbar_level ?? 'standard',
  dependency_logic_operator: question.dependency_logic_operator ?? 'and',
  options: question.options ?? [],
  conditions: question.conditions ?? [],
});

// The backend refuses a field of another type, even one at its default, so
// each type sends only its own; these are the backend's type-only fields.
export const toSurveyQuestionRequest = (
  question: LocalQuestion,
): SurveyQuestionRequest => {
  const type = question.question_type;
  return {
    key: question.key,
    description: question.description,
    // The step offers no file types, which is all that sets the two apart.
    question_type: type as SurveyQuestionTypeEnum,
    required: question.required,
    user_guidance: question.user_guidance,
    dependency_logic_operator: question.dependency_logic_operator,
    ...(isQuestionSelectType(type) && { options: question.options }),
    ...(RANGE_QUESTION_TYPES.includes(type) && {
      min_value: question.min_value,
      max_value: question.max_value,
    }),
    ...(type === 'likert' && {
      likert_scale_length: question.likert_scale_length,
      likert_low_label: question.likert_low_label,
      likert_high_label: question.likert_high_label,
      likert_allow_na: question.likert_allow_na,
    }),
    ...(type === 'rich_text' && {
      rich_text_char_limit: question.rich_text_char_limit,
      rich_text_toolbar_level: question.rich_text_toolbar_level,
    }),
    conditions: question.conditions,
  };
};

export const getTypeLabel = (type: LocalQuestion['question_type']) =>
  questionTypeOptions.find((option) => option.value === type)?.label ?? type;

export const removeQuestion = (
  questions: LocalQuestion[],
  key: string,
): LocalQuestion[] =>
  questions
    .filter((question) => question.key !== key)
    .map((question) => ({
      ...question,
      conditions: question.conditions.filter(
        (condition) => condition.depends_on !== key,
      ),
    }));

export const moveQuestion = (
  questions: LocalQuestion[],
  from: number,
  to: number,
): LocalQuestion[] => {
  const result = [...questions];
  const [moved] = result.splice(from, 1);
  result.splice(to, 0, moved);
  return result;
};

interface CopyTarget {
  key: string;
  type: LocalQuestion['question_type'];
  // By source option key; an option the target lacks is missing.
  options: Map<string, string>;
}

// Copies get keys of their own, so copying a survey twice can't collide. A
// question whose text is already in the survey is skipped, as texts must be
// unique, and conditions on it move to the question already there: to its
// options with the same label, and only while it has the same type, or the
// condition would mean something else. A condition on a question outside
// the copy can't be remapped and would be refused on save, so it is dropped.
export const copyQuestions = (
  existing: LocalQuestion[],
  source: LocalQuestion[],
): { questions: LocalQuestion[]; skipped: string[] } => {
  const byText = new Map(
    existing.map((question) => [question.description.trim(), question]),
  );
  const isSkipped = (question: LocalQuestion) =>
    byText.has(question.description.trim());
  const targets = new Map<string, CopyTarget>(
    source.map((question) => {
      const match = byText.get(question.description.trim());
      if (!match) {
        return [
          question.key,
          {
            key: newKey(),
            type: question.question_type,
            options: new Map(
              question.options.map((option) => [option.key, newKey()]),
            ),
          },
        ];
      }
      const labels = new Map(
        match.options.map((option) => [option.label, option.key]),
      );
      return [
        question.key,
        {
          key: match.key,
          type:
            match.question_type === question.question_type
              ? match.question_type
              : undefined,
          options: new Map(
            question.options
              .filter((option) => labels.has(option.label))
              .map((option) => [option.key, labels.get(option.label)]),
          ),
        },
      ];
    }),
  );
  const remapCondition = (condition: LocalQuestion['conditions'][number]) => {
    const target = targets.get(condition.depends_on);
    if (!target?.type) return [];
    if (!isQuestionSelectType(target.type)) {
      return [{ ...condition, depends_on: target.key }];
    }
    const values = [condition.required_answer_value]
      .flat()
      .map((value) => target.options.get(value as string))
      .filter(Boolean);
    if (!values.length) return [];
    return [
      {
        ...condition,
        depends_on: target.key,
        required_answer_value: Array.isArray(condition.required_answer_value)
          ? values
          : values[0],
      },
    ];
  };
  return {
    questions: source
      .filter((question) => !isSkipped(question))
      .map((question) => {
        const target = targets.get(question.key);
        return {
          ...question,
          key: target.key,
          options: question.options.map((option) => ({
            ...option,
            key: target.options.get(option.key),
          })),
          conditions: question.conditions.flatMap(remapCondition),
        };
      }),
    skipped: source
      .filter(isSkipped)
      .map((question) => question.description.trim()),
  };
};

// Trimmed and case-sensitive, as the backend compares them.
export const duplicateDescriptions = (questions: LocalQuestion[]): string[] => {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const question of questions) {
    const description = question.description.trim();
    if (seen.has(description)) duplicates.add(description);
    seen.add(description);
  }
  return [...duplicates];
};

// An edit that removes an option, or changes the question's type, leaves
// conditions on it pointing at answers it can no longer give.
export const pruneStaleConditions = (
  questions: LocalQuestion[],
  previous: LocalQuestion,
): LocalQuestion[] => {
  const edited = questions.find((question) => question.key === previous.key);
  if (!edited) return questions;
  const typeChanged = edited.question_type !== previous.question_type;
  const optionKeys = new Set(edited.options.map((option) => option.key));
  const isSelect = isQuestionSelectType(edited.question_type);
  return questions.map((question) => ({
    ...question,
    conditions: question.conditions.flatMap((condition) => {
      if (condition.depends_on !== edited.key) return [condition];
      if (typeChanged) return [];
      if (!isSelect) return [condition];
      const value = condition.required_answer_value;
      if (Array.isArray(value)) {
        const kept = value.filter((key) => optionKeys.has(key));
        return kept.length
          ? [{ ...condition, required_answer_value: kept }]
          : [];
      }
      return optionKeys.has(value as string) ? [condition] : [];
    }),
  }));
};
