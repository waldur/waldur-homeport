import {
  ChecklistOperators,
  ChecklistTypeEnum,
  QuestionTypeEnum,
} from 'waldur-js-client';

import { translate } from '@waldur/i18n';

export const checklistTypeOptions: Array<{ label; value: ChecklistTypeEnum }> =
  [
    { label: translate('Project compliance'), value: 'project_compliance' },
    { label: translate('Offering compliance'), value: 'offering_compliance' },
    { label: translate('Proposal compliance'), value: 'proposal_compliance' },
    { label: translate('Project metadata'), value: 'project_metadata' },
  ];

export const questionTypeOptions: Array<{ label; value: QuestionTypeEnum }> = [
  { label: translate('Text input'), value: 'text_input' },
  { label: translate('Text area'), value: 'text_area' },
  { label: translate('Number'), value: 'number' },
  { label: translate('Boolean'), value: 'boolean' },
  { label: translate('Single select'), value: 'single_select' },
  { label: translate('Multi select'), value: 'multi_select' },
  { label: translate('Date'), value: 'date' },
  { label: translate('File'), value: 'file' },
];

export const questionConditionOperatorOptions: Array<{
  label;
  value: ChecklistOperators;
  compatible: QuestionTypeEnum[];
}> = [
  {
    label: translate('Exact match'),
    value: 'equals',
    compatible: ['boolean', 'date', 'number'],
  },
  {
    label: translate('Not equal to'),
    value: 'not_equals',
    compatible: ['boolean', 'date', 'number'],
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
