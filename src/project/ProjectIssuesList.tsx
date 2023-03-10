import { FunctionComponent } from 'react';
import { Col, Row } from 'react-bootstrap';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import { Panel } from '@waldur/core/Panel';
import { IssuesList } from '@waldur/issues/list/IssuesList';
import { getProject } from '@waldur/workspace/selectors';

const mapStateToProps = createSelector(getProject, (project) => ({
  scope: { project },
  filter: { project: project && project.url },
}));

const ProjectIssuesListComponent = connect(mapStateToProps)(IssuesList);

export const ProjectIssuesList: FunctionComponent = () => (
  <Row>
    <Col md={12}>
      <Panel>
        <ProjectIssuesListComponent hiddenColumns={['customer', 'project']} />
      </Panel>
    </Col>
  </Row>
);
