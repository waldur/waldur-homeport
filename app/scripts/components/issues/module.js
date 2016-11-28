import issueCreate from './create';
import issuesList from './issues-list';
import issueRoutes from './routes';
import issuesWorkspace from './issues-workspace';
import issuesDashboard from './issues-dashboard';
import issuesShortList from './issues-short-list';
import issueQuickCreate from './issue-quick-create';
import issuesActivityStream from './issues-activity-stream';

import FakeIssuesService from './fake-issues-service';
import FakeIssueCommentsService from './fake-issue-comments-service';

export default module => {
  module.directive('issuesList', issuesList);
  module.directive('issueCreate', issueCreate);
  module.directive('issuesWorkspace', issuesWorkspace);
  module.directive('issuesDashboard', issuesDashboard);
  module.directive('issuesShortList', issuesShortList);
  module.directive('issueQuickCreate', issueQuickCreate);
  module.directive('issuesActivityStream', issuesActivityStream);
  module.service('FakeIssuesService', FakeIssuesService);
  module.service('FakeIssueCommentsService', FakeIssueCommentsService);
  module.config(issueRoutes);
}
