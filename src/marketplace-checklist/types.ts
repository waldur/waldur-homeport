import {
  ChecklistOperators,
  DependencyLogicOperatorEnum,
  QuestionTypeEnum,
} from 'waldur-js-client';

export interface ChecklistQuestionForm {
  description: string; // Question
  user_guidance?: string;
  question_type: QuestionTypeEnum;
  required?: boolean;
  order?: number;
  min_value?: string; // Number question type
  max_value?: string; // Number question type
  options?: string[]; // Select question type
  guidance?: Array<{
    answer: string;
    solution: string;
  }>;
  conditions?: Array<{
    uuid?: string;
    depends_on_question: string;
    operator: ChecklistOperators;
    required_answer_value: unknown;
  }>;
  dependency_logic_operator: DependencyLogicOperatorEnum;
  review_answer_value?: string;
  // Onboarding metadata fields
  maps_to_customer_field?: string;
  intent_field?: string;
  // Likert scale question type
  likert_scale_length?: 3 | 5 | 7;
  likert_low_label?: string;
  likert_high_label?: string;
  likert_allow_na?: boolean;
  // Rich text question type
  rich_text_char_limit?: string;
  rich_text_toolbar_level?: RichTextToolbarLevel;
}

export type RichTextToolbarLevel = 'minimal' | 'standard' | 'extended';

export type LikertScaleLength = 3 | 5 | 7;

export interface LikertConfig {
  likert_scale_length?: LikertScaleLength;
  likert_low_label?: string;
  likert_high_label?: string;
  likert_allow_na?: boolean;
}
