import React, { FunctionComponent } from 'react';
import { Table } from 'react-bootstrap';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';

import { AnswerGroup } from './AnswerGroup';
import { Answers, Question } from './types';

interface TableProps {
  answers: Answers;
  questions: Question[];
  setAnswers(answers: Answers): void;
  readOnly: boolean;
}

const QuestionGroup: FunctionComponent<{
  answers: Answers;
  question: Question;
}> = ({ question, answers }) => (
  <>
    {question.description}
    {answers[question.uuid] !== question.correct_answer &&
      question.solution && <p>{question.solution}</p>}
    {answers[question.uuid] !== question.correct_answer &&
      question.category_uuid && (
        <p>
          <Link
            state="marketplace-category"
            params={{ category_uuid: question.category_uuid }}
            label={translate('Find solution')}
          />
        </p>
      )}
  </>
);

const TableHeader: FunctionComponent = () => (
  <thead>
    <tr>
      <th className="col-sm-1">#</th>
      <th>{translate('Question')}</th>
      <th className="col-sm-3 text-center">{translate('Answer')}</th>
    </tr>
  </thead>
);

const RenderAnswer: React.FC<{ value: boolean | null }> = ({ value }) =>
  value === true ? (
    <>{translate('Yes')}</>
  ) : value === false ? (
    <>{translate('No')}</>
  ) : (
    <>{translate('N/A')}</>
  );

const TableBody: FunctionComponent<TableProps> = ({
  questions,
  answers,
  setAnswers,
  readOnly,
}) => (
  <tbody>
    {questions.map((question, index) => (
      <tr key={question.uuid}>
        <td>{index + 1}</td>
        <td>
          <QuestionGroup question={question} answers={answers} />
        </td>
        <td className="text-center">
          {readOnly ? (
            <RenderAnswer value={answers[question.uuid]} />
          ) : (
            <AnswerGroup
              question={question}
              answers={answers}
              setAnswers={setAnswers}
            />
          )}
        </td>
      </tr>
    ))}
  </tbody>
);

export const AnswersTable: FunctionComponent<TableProps> = ({
  questions,
  answers,
  setAnswers,
  readOnly,
}) => (
  <Table responsive={true} bordered={true} striped={true} className="m-t-md">
    <TableHeader />
    <TableBody
      questions={questions}
      answers={answers}
      setAnswers={setAnswers}
      readOnly={readOnly}
    />
  </Table>
);
