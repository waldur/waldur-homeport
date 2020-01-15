import * as React from 'react';
import { useEffect, useState, useMemo } from 'react';
import * as Button from 'react-bootstrap/lib/Button';
import * as Table from 'react-bootstrap/lib/Table';
import { useSelector } from 'react-redux';
import Select from 'react-select';

import { getAll } from '@waldur/core/api';
import { Link } from '@waldur/core/Link';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { useQuery } from '@waldur/core/useQuery';
import { translate } from '@waldur/i18n';
import { connectAngularComponent } from '@waldur/store/connect';
import { getProject } from '@waldur/workspace/selectors';

const getData = async project => {
  const questions = await getAll('/marketplace-checklist-questions/');
  const answers = await getAll('/marketplace-checklist-answers/',
  {params: {project_uuid: project.uuid}});
  return {questions, answers};
};

const ChecklistPanel = ({ questions, answers }) => {
  if (questions.length === 0) {
    return <>{translate('There are no checklist yet.')}</>;
  }
  const [checklist, setChecklist] = useState(questions[0]);
  const checklistAnswers = useMemo(() => {
    return answers
      .filter(answer => answer.checklist_uuid === checklist.uuid)
      .reduce((result, answer) => ({
        ...result,
        [answer.question_uuid]: answer.value,
      }), {});
  }, [checklist]);
  const handleSubmit = () => alert('Answers are being submitted');
  return (
    <>
      <Select
        labelKey="name"
        valueKey="uuid"
        value={checklist}
        onChange={setChecklist}
        options={questions}
      />
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
            <th className="col-sm-1">
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
                {question.category_uuid && (
                  <p>
                    <Link
                      state="marketplace-category"
                      params={{category_uuid: question.category_uuid}}
                      label={translate('Go to marketplace')}
                    />
                  </p>
                )}
              </td>
              <td>
                <input
                  type="checkbox"
                  checked={checklistAnswers[question.uuid]}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <p>
        <Button
          onClick={handleSubmit}
          bsStyle="primary">
          {translate('Submit')}
        </Button>
      </p>
    </>
  );
};

const ProjectChecklist = () => {
  const project = useSelector(getProject);
  if (!project) {
    return null;
  }
  const {state, call} = useQuery(getData, [project]);
  useEffect(call, []);
  if (state.loading) {
    return <LoadingSpinner/>;
  } else if (state.erred) {
    return <>{translate('Unable to load checklist questions.')}</>;
  } else if (state.data) {
    return <ChecklistPanel {...state.data}/>;
  } else {
    return null;
  }
};

export default connectAngularComponent(ProjectChecklist);
