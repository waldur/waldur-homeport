import * as React from 'react';
import { useDispatch } from 'react-redux';
import { change } from 'redux-form';

import { FORM_ID, FIELD_MAP } from './constants';
import { StringField } from './StringField';
import { Question } from './types';

const parseDefaultValue = (question: Question) => {
  if (question.type === 'boolean') {
    return Boolean(question.default);
  } else {
    return question.default;
  }
};

export const QuestionItem: React.FC<{
  question: Question;
}> = ({ question }) => {
  const dispatch = useDispatch();

  const setInitialValue = React.useCallback(() => {
    if (question.default) {
      dispatch(
        change(
          FORM_ID,
          `answers.${question.variable}`,
          parseDefaultValue(question),
        ),
      );
    }
  }, [question, dispatch]);

  React.useEffect(setInitialValue, [question]);

  return React.createElement(FIELD_MAP[question.type] || StringField, question);
};
