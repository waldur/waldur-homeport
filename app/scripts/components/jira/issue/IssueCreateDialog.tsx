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

const PureIssueCreateDialog = (props: Props) => {
  const project = props.resolve.project;
  return (
    <ModalDialog title={props.translate('Create request')} footer={<CloseDialogButton/>}>
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
