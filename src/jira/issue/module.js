import * as ResourceSummary from '@waldur/resource/summary/registry';

import jiraIssueCreateDialog from './IssueCreateContainer';
import { JiraIssueSummary } from './JiraIssueSummary';
import tabsConfig from './tabs';

export default module => {
  ResourceSummary.register('JIRA.Issue', JiraIssueSummary);
  module.config(tabsConfig);
  module.component('jiraIssueCreateDialog', jiraIssueCreateDialog);
};
