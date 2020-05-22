import * as React from 'react';
import { useDispatch } from 'react-redux';
import { change } from 'redux-form';

import { Question } from '../types';

import { FORM_ID, FIELD_MAP } from './constants';
import { StringField } from './StringField';

const parseDefaultValue = (question: Question) => {
  if (question.type === 'boolean') {
    return question.default === 'true';
  } else {
    return question.default;
  }
};

export const QuestionItem: React.FC<{
  question: Question;
}> = ({ question }) => {
  const dispatch = useDispatch();

  const setInitialValue = React.useCallback(() => {
    const value = parseDefaultValue(question);
    if (value) {
      dispatch(change(FORM_ID, `answers.${question.variable}`, value));
    }
  }, [question, dispatch]);

  React.useEffect(setInitialValue, [question]);

  return React.createElement(FIELD_MAP[question.type] || StringField, question);
};
