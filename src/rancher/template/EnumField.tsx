import * as React from 'react';
import * as FormControl from 'react-bootstrap/lib/FormControl';

import { translate } from '@waldur/i18n';

import { DecoratedField } from './DecoratedField';
import { Question } from './types';

export const EnumField: React.FC<{ question: Question }> = ({ question }) => (
  <DecoratedField
    question={question}
    component={fieldProps => (
      <FormControl componentClass="select" {...fieldProps.input}>
        <option>{translate('Select an option...')}</option>
        {(question.options || []).map((question, index) => (
          <option value={question} key={index}>
            {question}
          </option>
        ))}
      </FormControl>
    )}
  />
);
