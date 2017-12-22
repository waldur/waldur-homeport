import JiraIssuesService from './jira-issues-service';
import jiraIssuesList from './jira-issues-list';
import jiraIssueCreateDialog from './IssueCreateDialog';

export default module => {
  module.component('jiraIssuesList', jiraIssuesList);
  module.component('jiraIssueCreateDialog', jiraIssueCreateDialog);
  module.service('JiraIssuesService', JiraIssuesService);
};
