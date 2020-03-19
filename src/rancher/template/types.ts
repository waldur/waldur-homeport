type QuestionType = 'boolean' | 'string' | 'enum' | 'secret';

export interface Question {
  variable: string;
  label: string;
  description: string;
  type: QuestionType;
  options?: string[];
  default?: string | boolean;
  group: string;
  required: boolean;
  showIf?: string;
}
