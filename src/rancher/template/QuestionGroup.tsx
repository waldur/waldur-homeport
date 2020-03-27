import * as React from 'react';
import * as Row from 'react-bootstrap/lib/Row';

import { translate } from '@waldur/i18n';

import { GroupHeader } from './GroupHeader';
import { QuestionItem } from './QuestionItem';
import { Question } from './types';
import { groupByN } from './utils';

export const QuestionGroup: React.FC<{
  title: string;
  questions: Question[];
}> = ({ title, questions }) => (
  <React.Fragment>
    <GroupHeader title={title || translate('Configuration options')} />
    {groupByN(2, questions).map((group, groupIndex) => (
      <Row key={groupIndex}>
        {group.map((question, questionIndex) => (
          <QuestionItem key={questionIndex} question={question} />
        ))}
      </Row>
    ))}
  </React.Fragment>
);
