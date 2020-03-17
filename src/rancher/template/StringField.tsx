import * as React from 'react';
import * as FormControl from 'react-bootstrap/lib/FormControl';

import { DecoratedField } from './DecoratedField';
import { Question } from './types';

export const StringField: React.FC<{ question: Question }> = ({ question }) => (
  <DecoratedField
    question={question}
    component={fieldProps => <FormControl {...fieldProps.input} />}
  />
);
