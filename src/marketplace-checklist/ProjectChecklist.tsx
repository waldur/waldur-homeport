import * as React from 'react';
import * as Button from 'react-bootstrap/lib/Button';
import { useSelector } from 'react-redux';
import Select from 'react-select';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { connectAngularComponent } from '@waldur/store/connect';
import { getProject } from '@waldur/workspace/selectors';

import { AnswersTable } from './AnswersTable';
import { useChecklist } from './useChecklist';

const SubmitButton = ({ submitting, submit }) => (
  <Button
    onClick={() => submit()}
    bsStyle="primary"
    disabled={submitting}>
    {submitting && <><i className="fa fa-spinner fa-spin"/>{' '}</>}
    {translate('Submit')}
  </Button>
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
