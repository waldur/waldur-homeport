import * as React from 'react';
import { compose } from 'redux';
import { reduxForm } from 'redux-form';

import { StringField, TextField, SelectIconField } from '@waldur/form-react';
import { TranslateProps, withTranslation } from '@waldur/i18n';
import { ActionDialog } from '@waldur/modal/ActionDialog';
import { connectAngularComponent } from '@waldur/store/connect';

import { createIssue } from './actions';
import { JiraProject } from './types';

interface Props extends TranslateProps {
  resolve: {
    project: JiraProject
  };
}

const Dialog = props => {
  const submit = props.handleSubmit((data, dispatch) => createIssue({
    ...data,
    project: props.project,
  }, dispatch));

  return (
    <ActionDialog
      title={props.translate('Create request')}
      submitLabel={props.translate('Create request')}
      onSubmit={submit}
      submitting={props.submitting}
      error={props.error}>
      <SelectIconField
        name="type"
        label={props.translate('Request type')}
        options={props.project.issue_types}
        required={true}
        clearable={false}
        labelKey="name"
        valueKey="url"
        iconKey="icon_url"
      />
      <StringField
        name="summary"
        label={props.translate('Summary')}
        required={true}
      />
      <TextField
        name="description"
        label={props.translate('Description')}
      />
    </ActionDialog>
  );
};

const enhance = compose(
  withTranslation,
  reduxForm({form: 'issueCreate'}),
);

const DialogComponent = enhance(Dialog);

export const IssueCreateDialog = (props: Props) => (
  <DialogComponent
    project={props.resolve.project}
    initialValues={{type: props.resolve.project.issue_types[0]}}
  />
);

export default connectAngularComponent(IssueCreateDialog, ['resolve']);
