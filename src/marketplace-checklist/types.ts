import { ChecklistOperators, QuestionTypeEnum } from 'waldur-js-client';

export interface ChecklistQuestionForm {
  description: string; // Question
  question_type: QuestionTypeEnum;
  min_value?: string; // Number question type
  max_value?: string; // Number question type
  options?: string[]; // Select question type
  guidance?: Array<{
    answer: string;
    solution: string;
  }>;
  conditions?: Array<{
    depends_on_question: string;
    operator: ChecklistOperators;
    required_answer_value: string;
  }>;
  review_answer_value?: string;
}
