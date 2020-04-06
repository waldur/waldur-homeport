import * as React from 'react';
import * as Table from 'react-bootstrap/lib/Table';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';

import { AnswerGroup } from './AnswerGroup';
import { Question, Answers } from './types';

interface TableProps {
  answers: Answers;
  questions: Question[];
  setAnswers(answers: Answers): void;
}

const QuestionGroup = ({
  question,
  answers,
}: {
  answers: Answers;
  question: Question;
}) => (
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

const TableHeader = () => (
  <thead>
    <tr>
      <th className="col-sm-1">#</th>
      <th>{translate('Question')}</th>
      <th className="col-sm-3 text-center">{translate('Answer')}</th>
    </tr>
  </thead>
);

const TableBody = ({ questions, answers, setAnswers }: TableProps) => (
  <tbody>
    {questions.map((question, index) => (
      <tr key={question.uuid}>
        <td>{index + 1}</td>
        <td>
          <QuestionGroup question={question} answers={answers} />
        </td>
        <td className="text-center">
          <AnswerGroup
            question={question}
            answers={answers}
            setAnswers={setAnswers}
          />
        </td>
      </tr>
    ))}
  </tbody>
);

export const AnswersTable = ({
  questions,
  answers,
  setAnswers,
}: TableProps) => (
  <Table responsive={true} bordered={true} striped={true} className="m-t-md">
    <TableHeader />
    <TableBody
      questions={questions}
      answers={answers}
      setAnswers={setAnswers}
    />
  </Table>
);
