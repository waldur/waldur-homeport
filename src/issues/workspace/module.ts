import { connectAngularComponent } from '@waldur/store/connect';

import issueCommentsService from './issue-comments-service';
import IssueNavigationService, {
  attachStateUtils,
} from './issue-navigation-service';
import issuesHelpdesk from './issues-helpdesk';
import { IssuesDashboard } from './IssuesDashboard';
import { SupportSidebar } from './SupportSidebar';

export default module => {
  module.run(attachStateUtils);
  module.service('issueCommentsService', issueCommentsService);
  module.service('IssueNavigationService', IssueNavigationService);
  module.component('supportSidebar', connectAngularComponent(SupportSidebar));
  module.component('issuesDashboard', connectAngularComponent(IssuesDashboard));
  module.directive('issuesHelpdesk', issuesHelpdesk);
};
