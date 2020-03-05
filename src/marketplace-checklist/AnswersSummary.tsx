import * as React from 'react';

import { PieChart } from './PieChart';

const countValues = (dict, value) =>
  Object.keys(dict).filter(a => dict[a] === value).length;

export const AnswersSummary = ({ answers }) => {
  const counters = React.useMemo(
    () => ({
      positive: countValues(answers, true),
      negative: countValues(answers, false),
      unknown: countValues(answers, null),
    }),
    [answers],
  );
  return <PieChart {...counters} />;
};
