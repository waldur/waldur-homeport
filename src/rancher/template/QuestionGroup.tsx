import React from 'react';
import { Row } from 'react-bootstrap';

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
        <Row key={groupIndex}>
          {group.map((question) => (
            <QuestionItem
              key={question.variable}
              question={question}
              parentName={parentName}
            />
          ))}
        </Row>
      ))}
    </>
  );
};
