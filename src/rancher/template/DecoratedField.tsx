import * as React from 'react';
import * as Col from 'react-bootstrap/lib/Col';
import * as ControlLabel from 'react-bootstrap/lib/ControlLabel';
import * as HelpBlock from 'react-bootstrap/lib/HelpBlock';
import { Field, WrappedFieldProps } from 'redux-form';

import { DecoratedLabel } from './DecoratedLabel';
import { Question } from './types';

export const DecoratedField: React.FC<{
  question: Question;
  component: React.ComponentType<WrappedFieldProps>;
}> = ({ question, component }) => (
  <>
    <Col componentClass={ControlLabel} sm={2}>
      <DecoratedLabel question={question} />
    </Col>
    <Col sm={10}>
      <Field name={question.variable} component={component} />
      <HelpBlock>{question.description}</HelpBlock>
    </Col>
  </>
);
