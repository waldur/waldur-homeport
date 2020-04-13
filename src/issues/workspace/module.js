import { connectAngularComponent } from '@waldur/store/connect';

import issueCommentsService from './issue-comments-service';
import IssueNavigationService, {
  attachStateUtils,
} from './issue-navigation-service';
import issuesActivityStream from './issues-activity-stream';
import { issuesDashboard } from './issues-dashboard';
import issuesHelpdesk from './issues-helpdesk';
import issuesWorkspace from './issues-workspace';
import { SupportSidebar } from './SupportSidebar';

export default module => {
  module.run(attachStateUtils);
  module.service('issueCommentsService', issueCommentsService);
  module.service('IssueNavigationService', IssueNavigationService);
  module.component('supportSidebar', connectAngularComponent(SupportSidebar));
  module.component('issuesWorkspace', issuesWorkspace);
  module.component('issuesDashboard', issuesDashboard);
  module.directive('issuesActivityStream', issuesActivityStream);
  module.directive('issuesHelpdesk', issuesHelpdesk);
};
