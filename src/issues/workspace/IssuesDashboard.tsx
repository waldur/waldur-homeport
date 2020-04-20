import * as React from 'react';
import * as Col from 'react-bootstrap/lib/Col';
import * as Row from 'react-bootstrap/lib/Row';

import { isFeatureVisible } from '@waldur/features/connect';
import { angular2react } from '@waldur/shims/angular2react';

import { IssuesShortList } from '../list/IssuesShortList';

import { IssuesActivityStream } from './IssuesActivityStream';

const IssueQuickCreate = angular2react('issueQuickCreate');

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
