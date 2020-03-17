import * as React from 'react';
import * as FormGroup from 'react-bootstrap/lib/FormGroup';
import { useDispatch } from 'react-redux';
import { change } from 'redux-form';

import { FORM_ID, FIELD_MAP } from './constants';
import { Question } from './types';

export const QuestionItem: React.FC<{
  question: Question;
}> = ({ question }) => {
  const dispatch = useDispatch();

  React.useEffect(() => {
    if (question.default) {
      dispatch(change(FORM_ID, question.variable, question.default));
    }
  }, [question]);

  return (
    <FormGroup>
      {React.createElement(FIELD_MAP[question.type], { question })}
    </FormGroup>
  );
};
