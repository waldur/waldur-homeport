import * as React from 'react';
import * as Checkbox from 'react-bootstrap/lib/Checkbox';
import * as Col from 'react-bootstrap/lib/Col';
import * as HelpBlock from 'react-bootstrap/lib/HelpBlock';
import { Field } from 'redux-form';

import { DecoratedLabel } from './DecoratedLabel';
import { Question } from './types';

export const BooleanField: React.FC<{ question: Question }> = ({
  question,
}) => (
  <Col smOffset={2} sm={10}>
    <Field
      name={question.variable}
      component={fieldProps => (
        <Checkbox {...fieldProps.input}>
          <DecoratedLabel question={question} />
        </Checkbox>
      )}
    />
    {question.description && <HelpBlock>{question.description}</HelpBlock>}
  </Col>
);
