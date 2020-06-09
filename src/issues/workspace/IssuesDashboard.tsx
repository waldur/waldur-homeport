import * as React from 'react';
import * as Col from 'react-bootstrap/lib/Col';
import * as Row from 'react-bootstrap/lib/Row';

import { isFeatureVisible } from '@waldur/features/connect';
import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';

import { IssueQuickCreate } from '../create/IssueQuickCreate';
import { IssuesShortList } from '../list/IssuesShortList';

import { IssuesActivityStream } from './IssuesActivityStream';

export const IssuesDashboard = () => {
  useTitle(translate('Support dashboard'));
  return (
    <Row>
      <Col md={6}>
        <IssuesShortList />
      </Col>
      <Col md={6}>
        <IssueQuickCreate />
        {isFeatureVisible('support.activity_stream') && (
          <IssuesActivityStream />
        )}
      </Col>
    </Row>
  );
};
