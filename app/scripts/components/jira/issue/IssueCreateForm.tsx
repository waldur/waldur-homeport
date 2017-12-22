import * as React from 'react';
import { compose } from 'redux';
import { reduxForm } from 'redux-form';

import { withTranslation } from '@waldur/i18n';

import { FieldError } from './FieldError';
import { StringField, TextField } from './fields';
import { FormContainer } from './FormContainer';
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
    <div>
      <FormContainer submitting={props.submitting}>
        <IssueTypeField
          name="type"
          label={translate('Request type')}
          options={props.issueTypes}
          required={true}
        />
        <StringField
          name="summary"
          label={translate('Summary')}
          required={true}
        />
        <TextField
          name="description"
          label={translate('Description')}
        />
      </FormContainer>
      <FieldError error={props.error}/>
    </div>
  );
};

const enhance = compose(
  withTranslation,
  reduxForm({form: 'issueCreate'}),
);

export const IssueCreateForm: React.SFC<Props> = enhance(PureIssueCreateForm);
