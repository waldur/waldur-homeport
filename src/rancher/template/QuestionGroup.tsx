import React from 'react';

import { translate } from '@/i18n';

import { GroupHeader } from './GroupHeader';
import { QuestionItem } from './QuestionItem';
import { Question } from './types';
import { groupByN } from './utils';

export const QuestionGroup: React.FC<{
  title: string;
  questions: Question[];
  parentName?: string;
}> = ({ title, questions, parentName }) => {
  const groups = React.useMemo(() => groupByN(2, questions), [questions]);
  return (
    <>
      <GroupHeader title={title || translate('Configuration options')} />
      {groups.map((group, groupIndex) => (
        <div
          key={groupIndex}
          className="grid grid-cols-1 sm:grid-cols-2 gap-x-5"
        >
          {group.map((question) => (
            <QuestionItem
              key={question.variable}
              question={question}
              parentName={parentName}
            />
          ))}
        </div>
      ))}
    </>
  );
};
