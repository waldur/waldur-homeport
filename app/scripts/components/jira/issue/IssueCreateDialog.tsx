import * as React from 'react';
import { compose } from 'redux';
import { reduxForm } from 'redux-form';

import {
  FieldError,
  StringField,
  TextField,
  FormContainer,
  SubmitButton
} from '@waldur/form-react';
import { TranslateProps, withTranslation } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { connectAngularComponent } from '@waldur/store/connect';

import { createIssue } from './actions';
import { IssueTypeField } from './IssueTypeField';
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

  const footer = (
    <form onSubmit={submit}>
      <SubmitButton
        submitting={props.submitting}
        label={props.translate('Create request')}
      />
      <CloseDialogButton/>
    </form>
  );

  return (
    <ModalDialog
      title={props.translate('Create request')}
      footer={footer}>
      <FormContainer submitting={props.submitting}>
        <IssueTypeField
          name="type"
          label={props.translate('Request type')}
          options={props.project.issue_types}
          required={true}
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
      </FormContainer>
      <FieldError error={props.error}/>
    </ModalDialog>
  );
};

const enhance = compose(
  withTranslation,
  reduxForm({form: 'issueCreate'}),
);

const DialogComponent = enhance(Dialog);

export const IssueCreateDialog = withTranslation((props: Props) => (
  <DialogComponent
    project={props.resolve.project}
    initialValues={{type: props.resolve.project.issue_types[0]}}
  />
));

export default connectAngularComponent(IssueCreateDialog, ['resolve']);
