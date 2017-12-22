import * as React from 'react';
import { compose } from 'redux';
import { reduxForm } from 'redux-form';

import { withTranslation } from '@waldur/i18n';

import { FieldError } from './FieldError';
import { StringField, TextField } from './fields';
import { IssueTypeField } from './IssueTypeField';
import { JiraIssueType, JiraProject, JiraIssue } from './types';

interface Props {
  initialValues: Partial<JiraIssue>;
  issueTypes: JiraIssueType[];
  project: JiraProject;
}

const PureIssueCreateForm = props => {
  const { translate } = props;
  return (
    <form>
      <IssueTypeField
        name="type"
        label={translate('Request type')}
        options={props.issueTypes}
      />
      <StringField
        name="summary"
        label={translate('Summary')}
      />
      <TextField
        name="description"
        label={translate('Description')}
      />
      <FieldError error={props.error}/>
    </form>
  );
};

const enhance = compose(
  withTranslation,
  reduxForm({form: 'issueCreate'}),
);

export const IssueCreateForm: React.SFC<Props> = enhance(PureIssueCreateForm);
