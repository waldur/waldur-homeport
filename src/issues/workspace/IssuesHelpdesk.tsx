import { useState, useCallback, FunctionComponent } from 'react';
import { Card, Col } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';

import { IssueRegistration } from '../create/IssueRegistration';
import { useSupport } from '../hooks';
import { IssuesList } from '../list/IssuesList';

export const IssuesHelpdesk: FunctionComponent = () => {
  useTitle(translate('Helpdesk dashboard'));
  const [filter, setFilter] = useState({});
  const onSearch = useCallback((issue) => {
    if (!issue) {
      setFilter({});
      return;
    }
    const newFilter: Record<string, string> = {};
    if (issue.caller) {
      newFilter.caller = issue.caller.url;
    }
    if (issue.customer) {
      newFilter.customer = issue.customer.url;
    }
    if (issue.project) {
      newFilter.project = issue.project.url;
    }
    if (issue.summary) {
      newFilter.summary = issue.summary;
    }
    setFilter(newFilter);
  }, []);
  useSupport();
  return (
    <Col md={12}>
      <IssueRegistration onSearch={onSearch} />
      <Card>
        <Card.Body>
          <IssuesList filter={filter} />
        </Card.Body>
      </Card>
    </Col>
  );
};
