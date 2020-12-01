import React from 'react';
import { Row } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

import { Question } from '../types';

import { GroupHeader } from './GroupHeader';
import { QuestionItem } from './QuestionItem';
import { groupByN } from './utils';

export const QuestionGroup: React.FC<{
  title: string;
  questions: Question[];
}> = ({ title, questions }) => {
  const groups = React.useMemo(() => groupByN(2, questions), [questions]);
  return (
    <>
      <GroupHeader title={title || translate('Configuration options')} />
      {groups.map((group, groupIndex) => (
        <Row key={groupIndex}>
          {group.map((question) => (
            <QuestionItem key={question.variable} question={question} />
          ))}
        </Row>
      ))}
    </>
  );
};
