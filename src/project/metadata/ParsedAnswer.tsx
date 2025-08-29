import { FC } from 'react';
import { Answer, QuestionAdmin } from 'waldur-js-client';

import { BooleanBadge } from '@waldur/core/BooleanBadge';

interface ParsedAnswerProps {
  question: QuestionAdmin;
  answer: Answer;
}

export const ParsedAnswer: FC<ParsedAnswerProps> = ({ question, answer }) => {
  let answerValue = answer?.answer_data as any;

  if (
    ['single_select', 'multi_select'].includes(question.question_type) &&
    Array.isArray(answerValue) &&
    question.question_options?.length
  ) {
    answerValue = question.question_options
      .filter((opt) => answerValue.includes(opt.uuid))
      .map((opt) => opt.label);
  }

  return answerValue || [0, false].includes(answerValue) ? (
    Array.isArray(answerValue) ? (
      answerValue.join(', ') || 'N/A'
    ) : answerValue === true || answerValue === false ? (
      <BooleanBadge value={answerValue} />
    ) : (
      answerValue
    )
  ) : (
    'N/A'
  );
};
