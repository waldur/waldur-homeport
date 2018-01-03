import JiraIssuesService from './jira-issues-service';
import jiraIssuesList from './JiraIssuesList';
import jiraIssueCreateDialog from './IssueCreateContainer';

export default module => {
  module.component('jiraIssuesList', jiraIssuesList);
  module.component('jiraIssueCreateDialog', jiraIssueCreateDialog);
  module.service('JiraIssuesService', JiraIssuesService);
};
