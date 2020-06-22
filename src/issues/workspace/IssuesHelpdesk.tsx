import * as React from 'react';

import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';

import { IssueRegistration } from '../create/IssueRegistration';
import { IssuesList } from '../list/IssuesList';

export const IssuesHelpdesk = () => {
  useTitle(translate('Helpdesk dashboard'));
  const [filter, setFilter] = React.useState({});
  const onSearch = React.useCallback((issue) => {
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
  return (
    <div className="col-md-12">
      <IssueRegistration onSearch={onSearch} />
      <div className="ibox">
        <div className="ibox-content">
          <IssuesList filter={filter} />
        </div>
      </div>
    </div>
  );
};
