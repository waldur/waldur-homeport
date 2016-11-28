import issueCreate from './create';
import issueList from './list';
import issueRoutes from './routes';
import issuesWorkspace from './issues-workspace';
import issuesDashboard from './issues-dashboard';
import issuesShortList from './issues-short-list';
import issueQuickCreate from './issue-quick-create';
import issuesActivityStream from './issues-activity-stream';

export default module => {
  module.directive('issueList', issueList);
  module.directive('issueCreate', issueCreate);
  module.directive('issuesWorkspace', issuesWorkspace);
  module.directive('issuesDashboard', issuesDashboard);
  module.directive('issuesShortList', issuesShortList);
  module.directive('issueQuickCreate', issueQuickCreate);
  module.directive('issuesActivityStream', issuesActivityStream);
  module.config(issueRoutes);
}
