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
}> = [
  { label: translate('If (any of)'), value: 'in' },
  { label: translate('If (all of)'), value: 'not_equals' }, // FIX THIS: seems wrong
  { label: translate('If (none of)'), value: 'not_in' },
  { label: translate('If (equals)'), value: 'equals' },
  { label: translate('If (contains)'), value: 'contains' },
];

/** For disabling/hiding the things for non-functional parts of the checklist management */
export const CHECKLIST_FLAGS = {
  analyticsAndReports: false,

  checklistActionChangeStatus: false,

  questionFormUserGuidance: false,
  questionFormVisibility: false,
  questionFormTriggers: false,
};
