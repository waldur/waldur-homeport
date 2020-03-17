import * as React from 'react';
import * as FormGroup from 'react-bootstrap/lib/FormGroup';

import { BooleanField } from './BooleanField';
import { EnumField } from './EnumField';
import { StringField } from './StringField';
import { Question } from './types';

const FieldMap = {
  boolean: BooleanField,
  string: StringField,
  enum: EnumField,
  secret: EnumField,
};

export const QuestionItem: React.FC<{
  question: Question;
}> = ({ question }) => (
  <FormGroup>
    {React.createElement(FieldMap[question.type], { question })}
  </FormGroup>
);
