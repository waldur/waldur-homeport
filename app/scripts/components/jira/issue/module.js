import JiraIssuesService from './jira-issues-service';
import jiraIssuesList from './jira-issues-list';

export default module => {
  module.component('jiraIssuesList', jiraIssuesList);
  module.service('JiraIssuesService', JiraIssuesService);
};
