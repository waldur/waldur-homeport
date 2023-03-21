import { FunctionComponent } from 'react';
import { Col, Row } from 'react-bootstrap';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import { Panel } from '@waldur/core/Panel';
import { IssuesList } from '@waldur/issues/list/IssuesList';
import { getUser } from '@waldur/workspace/selectors';

const mapStateToProps = createSelector(getUser, (user) => ({
  scope: { user },
  filter: { user: user && user.url },
}));

const UserIssuesComponent = connect(mapStateToProps)(IssuesList);

export const UserIssuesList: FunctionComponent = () => (
  <Row>
    <Col md={12}>
      <Panel>
        <UserIssuesComponent />
      </Panel>
    </Col>
  </Row>
);
