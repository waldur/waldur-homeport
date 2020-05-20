import IssueNavigationService, {
  attachStateUtils,
} from './issue-navigation-service';

export default module => {
  module.run(attachStateUtils);
  module.service('IssueNavigationService', IssueNavigationService);
};
