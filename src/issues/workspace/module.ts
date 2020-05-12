import IssueNavigationService, {
  attachStateUtils,
} from './issue-navigation-service';
import issuesHelpdesk from './issues-helpdesk';

export default module => {
  module.run(attachStateUtils);
  module.service('IssueNavigationService', IssueNavigationService);
  module.directive('issuesHelpdesk', issuesHelpdesk);
};
