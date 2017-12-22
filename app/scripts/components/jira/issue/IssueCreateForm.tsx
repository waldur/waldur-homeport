import * as React from 'react';
import { compose } from 'redux';
import { reduxForm } from 'redux-form';

import { withTranslation } from '@waldur/i18n';

import { createIssue } from './actions';
import { StringField, TextField } from './fields';
import { IssueTypeField } from './IssueTypeField';
import { JiraIssueType, JiraProject } from './types';

interface FormData {
  type: JiraIssueType;
  summary: string;
  description?: string;
}

interface Props {
  initialValues: Partial<FormData>;
  issueTypes: JiraIssueType[];
  project: JiraProject;
}

const PureIssueCreateForm = props => {
  const { handleSubmit, translate, issueTypes, project } = props;
  const submit = handleSubmit((data, dispatch) => createIssue({
    ...data,
    project,
  }, dispatch));
  return (
    <form onSubmit={submit}>
      <IssueTypeField
        name="type"
        label={translate('Request type')}
        options={issueTypes}
      />
      <StringField
        name="summary"
        label={translate('Summary')}
      />
      <TextField
        name="description"
        label={translate('Description')}
      />
      <button
        type="submit"
        className="btn btn-default">
        {translate('Submit')}
      </button>
    </form>
  );
};

const enhance = compose(
  withTranslation,
  reduxForm<FormData>({form: 'issueCreate'}),
);

export const IssueCreateForm: React.SFC<Props> = enhance(PureIssueCreateForm);
