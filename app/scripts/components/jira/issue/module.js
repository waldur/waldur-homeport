import tabsConfig from './tabs';
import JiraIssuesService from './jira-issues-service';
import jiraIssuesList from './JiraIssuesList';
import jiraIssueCreateDialog from './IssueCreateContainer';
import { JiraIssueSummary } from './JiraIssueSummary';
import * as ResourceSummary from '@waldur/resource/summary/registry';

export default module => {
  ResourceSummary.register('JIRA.Issue', JiraIssueSummary);
  module.config(tabsConfig);
  module.component('jiraIssuesList', jiraIssuesList);
  module.component('jiraIssueCreateDialog', jiraIssueCreateDialog);
  module.service('JiraIssuesService', JiraIssuesService);
};
