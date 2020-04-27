import { BooleanField } from './BooleanField';
import { EnumField } from './EnumField';
import { SecretField } from './SecretField';
import { StringField } from './StringField';

export const FIELD_MAP = {
  boolean: BooleanField,
  string: StringField,
  password: StringField,
  enum: EnumField,
  secret: SecretField,
};

export const FORM_ID = 'RancherTemplateQuestions';
