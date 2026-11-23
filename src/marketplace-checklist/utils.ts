import { useMemo } from 'react';
import {
  ChecklistOperators,
  ChecklistTypeEnum,
  QuestionTypeEnum,
} from 'waldur-js-client';

import { translate } from '@/i18n';

export const checklistTypeOptions: Array<{ label; value: ChecklistTypeEnum }> =
  [
    { label: translate('Project compliance'), value: 'project_compliance' },
    { label: translate('Offering compliance'), value: 'offering_compliance' },
    { label: translate('Proposal compliance'), value: 'proposal_compliance' },
    { label: translate('Project metadata'), value: 'project_metadata' },
    {
      label: translate('Onboarding customer data'),
      value: 'onboarding_customer',
    },
    { label: translate('Onboarding intent data'), value: 'onboarding_intent' },
    { label: translate('Feedback survey'), value: 'feedback' },
  ];

// Feedback checklists belong to their survey and are edited through it.
export const checklistAdminTypeOptions = checklistTypeOptions.filter(
  (opt) => opt.value !== 'feedback',
);

// Keyed by every type, so a type the API adds fails to compile until it is
// placed here, rather than silently missing from the admin. The form does not
// offer workflow-step checklists, but call imports create them, and the admin
// is where they are listed.
const LISTED_IN_ADMIN: Record<ChecklistTypeEnum, boolean> = {
  project_compliance: true,
  proposal_compliance: true,
  offering_compliance: true,
  project_metadata: true,
  onboarding_customer: true,
  onboarding_intent: true,
  workflow_step: true,
  feedback: false,
};

export const CHECKLIST_ADMIN_TYPES = (
  Object.keys(LISTED_IN_ADMIN) as ChecklistTypeEnum[]
).filter((type) => LISTED_IN_ADMIN[type]);

// The types calls use as forms: only these may belong to an organization,
// which limits them to that organization's own calls.
const CALL_FORM_CHECKLIST_TYPES: ChecklistTypeEnum[] = [
  'proposal_compliance',
  'workflow_step',
];

export const isCallFormChecklistType = (type?: ChecklistTypeEnum | null) =>
  !!type && CALL_FORM_CHECKLIST_TYPES.includes(type);

export const questionTypeOptions: Array<{ label; value: QuestionTypeEnum }> = [
  { label: translate('Text input'), value: 'text_input' },
  { label: translate('Text area'), value: 'text_area' },
  { label: translate('Number'), value: 'number' },
  { label: translate('Boolean'), value: 'boolean' },
  { label: translate('Single select'), value: 'single_select' },
  { label: translate('Multi select'), value: 'multi_select' },
  { label: translate('Date'), value: 'date' },
  { label: translate('File'), value: 'file' },
  { label: translate('Multiple files'), value: 'multiple_files' },
  { label: translate('Email'), value: 'email' },
  { label: translate('Phone number'), value: 'phone_number' },
  { label: translate('URL'), value: 'url' },
  { label: translate('Year'), value: 'year' },
  { label: translate('Country'), value: 'country' },
  { label: translate('Rating'), value: 'rating' },
  { label: translate('Likert scale'), value: 'likert' },
  { label: translate('Rich text'), value: 'rich_text' },
];

export const isQuestionSelectType = (questionType) =>
  ['single_select', 'multi_select'].includes(questionType);

export const isQuestionLikertType = (questionType) => questionType === 'likert';

export const isQuestionFileType = (questionType) =>
  ['file', 'multiple_files'].includes(questionType);

export const questionConditionOperatorOptions: Array<{
  label;
  value: ChecklistOperators;
  compatible: QuestionTypeEnum[];
}> = [
  {
    label: translate('Exact match'),
    value: 'equals',
    compatible: ['boolean', 'date', 'number', 'likert'],
  },
  {
    label: translate('Not equal to'),
    value: 'not_equals',
    compatible: ['boolean', 'date', 'number', 'likert'],
  },
  {
    label: translate('Text contains substring'),
    value: 'contains',
    compatible: ['text_input', 'text_area'],
  },
  {
    label: translate('Value exists in list'),
    value: 'in',
    compatible: ['single_select', 'multi_select'],
  },
  {
    label: translate('Value does not exist in list'),
    value: 'not_in',
    compatible: ['single_select', 'multi_select'],
  },
];

/** For disabling/hiding the things for non-functional parts of the checklist management */
export const CHECKLIST_FLAGS = {
  analyticsAndReports: false,

  checklistActionChangeStatus: false,

  questionFormUserGuidance: false,
  questionFormVisibility: true,
  questionFormTriggers: false,
};

// The types the backend keeps a min and max for, and checks answers against.
export const RANGE_QUESTION_TYPES: QuestionTypeEnum[] = [
  'number',
  'year',
  'rating',
];

export const useQuestionNumberValidator = (question) =>
  useMemo(
    () => (value) => {
      // Number(null) and Number('') are 0, which would fail a range like 1-5
      // for an optional question the respondent cleared.
      if (value === null || value === '') return undefined;
      const v = Number(value);
      if (
        (!v && v !== 0) ||
        !RANGE_QUESTION_TYPES.includes(question.question_type)
      )
        return undefined;
      const max = question.max_value ? Number(question.max_value) : null;
      const min = question.min_value ? Number(question.min_value) : null;

      if (min !== null && max !== null) {
        if (v < min || v > max) {
          return translate('Must be between {n} and {m}.', {
            n: Number(min),
            m: Number(max),
          });
        }
      } else if (min !== null && v < min) {
        return translate('Must be greater than or equal to {n}.', {
          n: Number(min),
        });
      } else if (max !== null && v > max) {
        return translate('Must be less than or equal to {n}.', {
          n: Number(max),
        });
      }
      return undefined;
    },
    [question],
  );
