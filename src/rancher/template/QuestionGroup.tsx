import * as React from 'react';
import * as Col from 'react-bootstrap/lib/Col';
import * as ControlLabel from 'react-bootstrap/lib/ControlLabel';
import * as FormGroup from 'react-bootstrap/lib/FormGroup';

import { QuestionItem } from './QuestionItem';
import { Question } from './types';

export const QuestionGroup: React.FC<{
  title: string;
  questions: Question[];
}> = ({ title, questions }) => (
  <React.Fragment>
    <FormGroup>
      <Col smOffset={2} sm={10}>
        <ControlLabel>{title}</ControlLabel>
      </Col>
    </FormGroup>
    {questions.map((question, questionIndex) => (
      <QuestionItem key={questionIndex} question={question} />
    ))}
  </React.Fragment>
);
