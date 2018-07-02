import issueCommentsService from './issue-comments-service';
import { attachStateUtils } from './issue-navigation-service';
import IssueNavigationService from './issue-navigation-service';
import issuesWorkspace from './issues-workspace';
import { issuesDashboard } from './issues-dashboard';
import issuesActivityStream from './issues-activity-stream';
import issuesHelpdesk from './issues-helpdesk';

export default module => {
  module.run(attachStateUtils);
  module.service('issueCommentsService', issueCommentsService);
  module.service('IssueNavigationService', IssueNavigationService);
  module.component('issuesWorkspace', issuesWorkspace);
  module.component('issuesDashboard', issuesDashboard);
  module.directive('issuesActivityStream', issuesActivityStream);
  module.directive('issuesHelpdesk', issuesHelpdesk);
};
