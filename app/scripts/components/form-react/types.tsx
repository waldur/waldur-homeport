import { WrappedFieldInputProps, Validator } from 'redux-form';

export interface FormField {
  name: string;
  input?: WrappedFieldInputProps;
  required?: boolean;
  label: string;
  description?: any;
  labelClass?: string;
  controlClass?: string;
  validate?: Validator | Validator[];
}
