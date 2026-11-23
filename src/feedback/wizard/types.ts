import {
  ChecklistOperators,
  DependencyLogicOperatorEnum,
  IdNamePair,
  LikertScaleLengthEnum,
  QuestionTypeEnum,
  RichTextToolbarLevelEnum,
} from 'waldur-js-client';

export type { VisibilityQuestion } from '@/marketplace-checklist/types';

interface LocalQuestionOption {
  key: string;
  label: string;
}

interface LocalQuestionCondition {
  depends_on: string;
  operator: ChecklistOperators;
  // Option keys for select questions, as the backend holds option uuids.
  required_answer_value: unknown;
}

// A question kept in the wizard's form state until the survey is saved. Keys
// are opaque: new items get a generated one, loaded items their uuid.
export interface LocalQuestion {
  key: string;
  description: string;
  question_type: QuestionTypeEnum;
  required: boolean;
  user_guidance: string;
  min_value: string | null;
  max_value: string | null;
  likert_scale_length: LikertScaleLengthEnum | null;
  likert_low_label: string;
  likert_high_label: string;
  likert_allow_na: boolean;
  rich_text_char_limit: number | null;
  rich_text_toolbar_level: RichTextToolbarLevelEnum;
  dependency_logic_operator: DependencyLogicOperatorEnum;
  options: LocalQuestionOption[];
  conditions: LocalQuestionCondition[];
}

export interface SurveyWizardValues {
  name: string;
  intro?: string;
  questions: LocalQuestion[];
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  max_prompts: number;
  snooze_days: number;
  all_users?: boolean;
  customers?: IdNamePair[];
  offerings?: IdNamePair[];
}
