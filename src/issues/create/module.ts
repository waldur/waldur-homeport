import { connectAngularComponent } from '@waldur/store/connect';

import issuePrioritiesService from './issue-priorities-service';
import issueQuickCreate from './issue-quick-create';
import issueRegistration from './issue-registration';
import issueUsersService from './issue-users';
import { IssueCreateDialog } from './IssueCreateDialog';

export default module => {
  module.component(
    'issueCreateDialog',
    connectAngularComponent(IssueCreateDialog, ['resolve']),
  );
  module.directive('issueQuickCreate', issueQuickCreate);
  module.directive('issueRegistration', issueRegistration);
  module.service('issueUsersService', issueUsersService);
  module.service('issuePrioritiesService', issuePrioritiesService);
};
