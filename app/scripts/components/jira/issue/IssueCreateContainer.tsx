import * as React from 'react';

import { TranslateProps } from '@waldur/i18n';
import { connectAngularComponent } from '@waldur/store/connect';

import { IssueCreateDialog } from './IssueCreateDialog';
import { JiraProject } from './types';

interface IssueCreateDialogContainerProps extends TranslateProps {
  resolve: {
    project: JiraProject
  };
}

export const IssueCreateDialogContainer = (props: IssueCreateDialogContainerProps) => (
  <IssueCreateDialog
    project={props.resolve.project}
    initialValues={{type: props.resolve.project.issue_types[0]}}
  />
);

export default connectAngularComponent(IssueCreateDialogContainer, ['resolve']);
