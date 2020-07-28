import * as React from 'react';
import * as Col from 'react-bootstrap/lib/Col';
import * as Row from 'react-bootstrap/lib/Row';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import { Panel } from '@waldur/core/Panel';
import { translate } from '@waldur/i18n';
import { IssuesList } from '@waldur/issues/list/IssuesList';
import { useTitle } from '@waldur/navigation/title';
import { getProject } from '@waldur/workspace/selectors';

const mapStateToProps = createSelector(getProject, (project) => ({
  scope: { project },
  filter: { project: project && project.url },
}));

const ProjectIssuesListComponent = connect(mapStateToProps)(IssuesList);

export const ProjectIssuesList = () => {
  useTitle(translate('Issues'));
  return (
    <div className="wrapper wrapper-content">
      <Row>
        <Col md={12}>
          <Panel>
            <ProjectIssuesListComponent hiddenColumns={['customer']} />
          </Panel>
        </Col>
      </Row>
    </div>
  );
};
