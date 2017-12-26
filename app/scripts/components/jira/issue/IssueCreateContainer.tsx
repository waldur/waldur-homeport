import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { reduxForm, formValueSelector } from 'redux-form';

import { withTranslation } from '@waldur/i18n';
import { connectAngularComponent } from '@waldur/store/connect';

import { createIssue, loadProjectIssues } from './actions';
import { IssueCreateDialog } from './IssueCreateDialog';
import { JiraProject } from './types';

interface IssueCreateDialogContainerProps {
  resolve: {
    project: JiraProject
  };
}

const FORM_ID = 'issueCreate';
const SUBTASK_ISSUE_TYPE = 'Sub-task';

const mapStateToProps = state => {
  const selector = formValueSelector(FORM_ID);
  const issueType = selector(state, 'type');
  const isSubtask = issueType && issueType.name === SUBTASK_ISSUE_TYPE;
  return { isSubtask };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  loadProjectIssues: query =>
    loadProjectIssues({query, project: ownProps.project}, dispatch),

  createIssue: data =>
    createIssue({...data, project: ownProps.project}, dispatch),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

const enhance = compose(
  connector,
  withTranslation,
  reduxForm({form: FORM_ID}),
);

const IssueCreateDialogComponent = enhance(IssueCreateDialog);

export const IssueCreateDialogContainer = (props: IssueCreateDialogContainerProps) => (
  <IssueCreateDialogComponent
    project={props.resolve.project}
    initialValues={{type: props.resolve.project.issue_types[0]}}
  />
);

export default connectAngularComponent(IssueCreateDialogContainer, ['resolve']);
