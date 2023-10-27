import { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import { IssuesList } from '@waldur/issues/list/IssuesList';
import { getProject } from '@waldur/workspace/selectors';

const mapStateToProps = createSelector(getProject, (project) => ({
  scope: { project },
  filter: { project: project && project.url },
}));

const ProjectIssuesListComponent = connect(mapStateToProps)(IssuesList);

export const ProjectIssuesList: FunctionComponent = () => (
  <ProjectIssuesListComponent hiddenColumns={['customer', 'project']} />
);
