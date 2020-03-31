import * as React from 'react';

import { PieChart } from './PieChart';
import { Question, Answers } from './types';

const countStats = (answers: Answers, questions: Question[]) => {
  let positive = 0;
  let negative = 0;
  let unknown = 0;
  questions.forEach(question => {
    if (answers[question.uuid] === undefined) {
      unknown += 1;
    } else if (answers[question.uuid] === question.correct_answer) {
      positive += 1;
    } else {
      negative += 1;
    }
  });
  return {
    positive,
    negative,
    unknown,
  };
};

export const AnswersSummary = ({
  answers,
  questions,
}: {
  answers: Answers;
  questions: Question[];
}) => {
  const counters = React.useMemo(() => countStats(answers, questions), [
    answers,
    questions,
  ]);
  return <PieChart {...counters} />;
};
