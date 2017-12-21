import * as React from 'react';

import { TranslateProps, withTranslation } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { connectAngularComponent } from '@waldur/store/connect';

import { FormGroup } from './FormGroup';
import { IssueTypeField } from './IssueTypeField';
import { JiraProject } from './types';

interface Props extends TranslateProps {
  resolve: {
    project: JiraProject
  };
}

const PureJiraCreateDialog = (props: Props) => (
  <ModalDialog title={props.translate('Create request')} footer={<CloseDialogButton/>}>
    <FormGroup label={props.translate('Request type')}>
      <IssueTypeField issueTypes={props.resolve.project.issue_types}/>
    </FormGroup>
    <FormGroup label={props.translate('Summary')}>
      <input type="text" className="form-control"/>
    </FormGroup>
    <FormGroup label={props.translate('Description')}>
      <textarea rows={5} className="form-control"/>
    </FormGroup>
  </ModalDialog>
);

export const JiraCreateDialog = withTranslation(PureJiraCreateDialog);

export default connectAngularComponent(JiraCreateDialog, ['resolve']);
