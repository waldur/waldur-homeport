import * as React from 'react';
import * as Table from 'react-bootstrap/lib/Table';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';

import { AnswerGroup } from './AnswerGroup';

const CategoryLink = ({ question }) =>
  question.category_uuid ? (
    <p>
      <Link
        state="marketplace-category"
        params={{category_uuid: question.category_uuid}}
        label={translate('Go to marketplace')}
      />
    </p>
  ) : null;

export const AnswersTable = ({ checklist, answers, setAnswers }) => (
  <Table
    responsive={true}
    bordered={true}
    striped={true}
    className="m-t-md"
  >
    <thead>
      <tr>
        <th className="col-sm-1">
          #
        </th>
        <th>{translate('Question')}</th>
        <th className="col-sm-3 text-center">
          {translate('Answer')}
        </th>
      </tr>
    </thead>
    <tbody>
      {checklist.questions.map((question, index) => (
        <tr key={question.uuid}>
          <td>
            {index + 1}
          </td>
          <td>
            {question.description}
            <CategoryLink question={question}/>
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
  </Table>
);
