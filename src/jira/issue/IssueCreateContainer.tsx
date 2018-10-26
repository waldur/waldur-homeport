import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { reduxForm, formValueSelector } from 'redux-form';

import { withTranslation } from '@waldur/i18n';
import { connectAngularComponent } from '@waldur/store/connect';

import * as actions from './actions';
import { IssueCreateDialog } from './IssueCreateDialog';
import { JiraProject } from './types';

interface IssueCreateDialogContainerProps {
  resolve: {
    project: JiraProject
  };
}

const FORM_ID = 'issueCreate';

const mapStateToProps = state => {
  const selector = formValueSelector(FORM_ID);
  const issueType = selector(state, 'type');
  const showParentField = issueType && issueType.subtask;
  return { showParentField };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  loadProjectIssues: query =>
    actions.loadProjectIssues({query, project: ownProps.project}, dispatch),

  loadProjectResources: query =>
    actions.loadProjectResources({query, project: ownProps.project}, dispatch),

  createIssue: data =>
    actions.createIssue({...data, project: ownProps.project}, dispatch),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

const enhance = compose(
  connector,
  reduxForm({form: FORM_ID}),
  withTranslation,
);

const IssueCreateDialogComponent = enhance(IssueCreateDialog);

export const IssueCreateDialogContainer = (props: IssueCreateDialogContainerProps) => (
  <IssueCreateDialogComponent
    project={props.resolve.project}
    initialValues={{
      type: props.resolve.project.issue_types[0],
      priority: props.resolve.project.priorities[0],
    }}
  />
);

export default connectAngularComponent(IssueCreateDialogContainer, ['resolve']);
