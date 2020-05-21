import * as React from 'react';
import * as Col from 'react-bootstrap/lib/Col';
import * as Row from 'react-bootstrap/lib/Row';

import { isFeatureVisible } from '@waldur/features/connect';

import { IssueQuickCreate } from '../create/IssueQuickCreate';
import { IssuesShortList } from '../list/IssuesShortList';

import { IssuesActivityStream } from './IssuesActivityStream';

export const IssuesDashboard = () => (
  <Row>
    <Col md={6}>
      <IssuesShortList />
    </Col>
    <Col md={6}>
      <IssueQuickCreate />
      {isFeatureVisible('support.activity_stream') && <IssuesActivityStream />}
    </Col>
  </Row>
);
