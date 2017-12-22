import JiraIssuesService from './jira-issues-service';
import jiraIssuesList from './jira-issues-list';
import jiraCreateDialog from './IssueCreateDialog';

export default module => {
  module.component('jiraIssuesList', jiraIssuesList);
  module.component('jiraCreateDialog', jiraCreateDialog);
  module.service('JiraIssuesService', JiraIssuesService);
};
