import issueCreateDialog from './issue-create-dialog';
import issuePrioritiesService from './issue-priorities-service';
import issueQuickCreate from './issue-quick-create';
import issueRegistration from './issue-registration';
import issueUsersService from './issue-users';

export default module => {
  module.component('issueCreateDialog', issueCreateDialog);
  module.directive('issueQuickCreate', issueQuickCreate);
  module.directive('issueRegistration', issueRegistration);
  module.service('issueUsersService', issueUsersService);
  module.service('issuePrioritiesService', issuePrioritiesService);
};
