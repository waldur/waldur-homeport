type QuestionType = 'boolean' | 'string' | 'enum' | 'secret';

export interface FieldProps {
  label: string;
  description?: string;
  variable: string;
  options?: string[];
  required?: boolean;
}

export interface Question extends FieldProps {
  type: QuestionType;
  default?: string | boolean;
  group?: string;
  showIf?: string;
}
