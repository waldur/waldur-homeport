import * as React from 'react';
import * as Button from 'react-bootstrap/lib/Button';
import * as Table from 'react-bootstrap/lib/Table';
import * as ToggleButton from 'react-bootstrap/lib/ToggleButton';
import * as ToggleButtonGroup from 'react-bootstrap/lib/ToggleButtonGroup';
import { useSelector } from 'react-redux';
import Select from 'react-select';

import { Link } from '@waldur/core/Link';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { connectAngularComponent } from '@waldur/store/connect';
import { getProject } from '@waldur/workspace/selectors';

import { useChecklist } from './useChecklist';

const AnswerGroup = ({ answers, question, setAnswers }) => (
  <ToggleButtonGroup
    value={{true: 'true', false: 'false', null: 'null'}[answers[question.uuid]]}
    onChange={value => setAnswers({
      ...answers,
      [question.uuid]: {true: true, false: false, null: null}[value],
    })}
    type="radio"
    name={`checklist-${question.uuid}`}
    defaultValue="null">
    <ToggleButton value="true">
      {translate('Yes')}
    </ToggleButton>
    <ToggleButton value="false">
      {translate('No')}
    </ToggleButton>
    <ToggleButton value="null">
      {translate('Not provided')}
    </ToggleButton>
  </ToggleButtonGroup>
);

const SubmitButton = ({ submitting, submit }) => (
  <Button
    onClick={() => submit()}
    bsStyle="primary"
    bsSize="small"
    disabled={submitting}>
    {submitting && <><i className="fa fa-spinner fa-spin"/>{' '}</>}
    {translate('Submit')}
  </Button>
);

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

const AnswersTable = ({ checklist, answers, setAnswers }) => (
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

const ProjectChecklist = () => {
  const project = useSelector(getProject);
  if (!project) {
    return null;
  }

  const state = useChecklist(project);

  if (state.loading) {
    return <LoadingSpinner/>;
  } else if (state.erred) {
    return <>{translate('Unable to load checklist questions.')}</>;
  } else if (state.data) {
    if (!state.checklist) {
      return <>{translate('There are no checklist yet.')}</>;
    }
    return (
      <>
        <Select
          labelKey="name"
          valueKey="uuid"
          value={state.checklist}
          onChange={state.setChecklist}
          options={state.data.questions}
        />
        <AnswersTable
          checklist={state.checklist}
          answers={state.answers}
          setAnswers={state.setAnswers}
        />
        <p>
          <SubmitButton
            submit={state.submit}
            submitting={state.submitting}
          />
        </p>
      </>
    );
  } else {
    return null;
  }
};

export default connectAngularComponent(ProjectChecklist);
