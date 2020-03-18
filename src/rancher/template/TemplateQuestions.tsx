import * as React from 'react';
import * as Form from 'react-bootstrap/lib/Form';
import { reduxForm } from 'redux-form';

import { QuestionGroup } from './QuestionGroup';
import { Question } from './types';

const groupQuestions = (questions: Question[]): Record<string, Question[]> =>
  questions.reduce(
    (groups, question) => ({
      ...groups,
      [question.group]: [...(groups[question.group] || []), question],
    }),
    {},
  );

const connector = reduxForm<any, { questions: Question[] }>({
  form: 'RancherTemplateQuestions',
});

export const TemplateQuestions = connector(props => {
  const groups = React.useMemo(() => groupQuestions(props.questions), [
    props.questions,
  ]);
  return (
    <Form horizontal>
      {Object.keys(groups).map((group, groupIndex) => (
        <QuestionGroup
          key={groupIndex}
          title={group}
          questions={groups[group]}
        />
      ))}
    </Form>
  );
});
