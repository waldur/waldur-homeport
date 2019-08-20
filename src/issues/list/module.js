import issuesList from './IssuesList';
import issuesShortList from './IssuesShortList';

export default module => {
  module.component('issuesList', issuesList);
  module.component('issuesShortList', issuesShortList);
};
