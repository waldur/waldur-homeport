import * as React from 'react';

import { TranslateProps, withTranslation } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { connectAngularComponent } from '@waldur/store/connect';

import { IssueCreateForm } from './IssueCreateForm';
import { JiraProject } from './types';

interface Props extends TranslateProps {
  resolve: {
    project: JiraProject
  };
}

const PureJiraCreateDialog = (props: Props) => (
  <ModalDialog title={props.translate('Create request')} footer={<CloseDialogButton/>}>
    <IssueCreateForm
      issueTypes={props.resolve.project.issue_types}
      // tslint:disable no-console
      onSubmit={values => console.log(values)}
    />
  </ModalDialog>
);

export const JiraCreateDialog = withTranslation(PureJiraCreateDialog);

export default connectAngularComponent(JiraCreateDialog, ['resolve']);
