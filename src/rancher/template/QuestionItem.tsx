import React from 'react';
import { useForm } from 'react-final-form';

import { FIELD_MAP } from './fields';
import { StringField } from './StringField';
import { Question } from './types';

const parseDefaultValue = (question: Question) => {
  if (question.type === 'boolean') {
    return question.default === 'true';
  } else {
    return question.default;
  }
};

export const QuestionItem: React.FC<{
  question: Question;
  parentName?: string;
}> = ({ question, parentName }) => {
  const form = useForm();

  const setInitialValue = React.useCallback(() => {
    const value = parseDefaultValue(question);
    if (value) {
      const name = parentName
        ? `${parentName}.${question.variable}`
        : question.variable;
      form.change(name, value);
    }
  }, [question, form, parentName]);

  React.useEffect(setInitialValue, [question]);

  const variable = parentName
    ? `${parentName}.${question.variable}`
    : question.variable;

  return React.createElement(FIELD_MAP[question.type] || StringField, {
    ...question,
    variable,
  });
};
