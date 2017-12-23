import * as React from 'react';

import { connectAngularComponent } from '@waldur/store/connect';

import { IssueCreateDialog } from './IssueCreateDialog';
import { JiraProject } from './types';

interface IssueCreateDialogContainerProps {
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
