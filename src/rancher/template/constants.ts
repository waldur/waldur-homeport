import { BooleanField } from './BooleanField';
import { EnumField } from './EnumField';
import { StringField } from './StringField';

export const FIELD_MAP = {
  boolean: BooleanField,
  string: StringField,
  password: StringField,
  enum: EnumField,
  secret: EnumField,
};

export const FORM_ID = 'RancherTemplateQuestions';
