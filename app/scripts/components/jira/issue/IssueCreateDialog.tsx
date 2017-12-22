import * as React from 'react';
import { compose } from 'redux';
import { reduxForm } from 'redux-form';

import { TranslateProps, withTranslation } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { connectAngularComponent } from '@waldur/store/connect';

import { createIssue } from './actions';
import { IssueCreateForm } from './IssueCreateForm';
import { SubmitButton } from './SubmitButton';
import { JiraProject } from './types';

interface Props extends TranslateProps {
  resolve: {
    project: JiraProject
  };
}

const PureFooter = props => {
  const submit = props.handleSubmit((data, dispatch) => createIssue({
    ...data,
    project: props.project,
  }, dispatch));

  return (
    <form onSubmit={submit}>
      <SubmitButton
        submitting={props.submitting}
        label={props.translate('Create request')}
      />
      <CloseDialogButton/>
    </form>
  );
};

const enhance = compose(
  withTranslation,
  reduxForm({form: 'issueCreate'}),
);

const Footer = enhance(PureFooter);

const PureIssueCreateDialog = (props: Props) => {
  const project = props.resolve.project;
  return (
    <ModalDialog title={props.translate('Create request')} footer={<Footer project={project}/>}>
      <IssueCreateForm
        issueTypes={project.issue_types}
        initialValues={{type: project.issue_types[0]}}
        project={project}
      />
    </ModalDialog>
  );
};

export const IssueCreateDialog = withTranslation(PureIssueCreateDialog);

export default connectAngularComponent(IssueCreateDialog, ['resolve']);
