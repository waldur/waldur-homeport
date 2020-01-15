import * as React from 'react';
import * as Button from 'react-bootstrap/lib/Button';
import * as Table from 'react-bootstrap/lib/Table';
import { useSelector } from 'react-redux';
import Select from 'react-select';

import { Link } from '@waldur/core/Link';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { connectAngularComponent } from '@waldur/store/connect';
import { getProject } from '@waldur/workspace/selectors';

import { useChecklist } from './useChecklist';

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
            {state.checklist.questions.map((question, index) => (
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
                    checked={state.answers[question.uuid] || false}
                    onChange={event => state.
                      setAnswers({
                      ...state.answers,
                      [question.uuid]: event.target.checked,
                    })}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        <p>
          <Button
            onClick={() => state.submit()}
            bsStyle="primary"
            disabled={state.submitting}>
            {state.submitting && <><i className="fa fa-spinner fa-spin"/>{' '}</>}
            {translate('Submit')}
          </Button>
        </p>
      </>
    );
  } else {
    return null;
  }
};

export default connectAngularComponent(ProjectChecklist);
