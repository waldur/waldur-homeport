import * as ResourceSummary from '@waldur/resource/summary/registry';

import jiraIssueCreateDialog from './IssueCreateContainer';
import { JiraIssueSummary } from './JiraIssueSummary';
import './tabs';

export default module => {
  ResourceSummary.register('JIRA.Issue', JiraIssueSummary);
  module.component('jiraIssueCreateDialog', jiraIssueCreateDialog);
};
