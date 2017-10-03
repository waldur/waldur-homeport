import issueCreateDialog from './issue-create-dialog';
import issueQuickCreate from './issue-quick-create';
import issueRegistration from './issue-registration';
import issueTypeSelect from './issue-type-select';
import issueUsersService from './issue-users';
import IssueTypesService from './issue-types-service';
import {ISSUE_IDS, ISSUE_ICONS, ISSUE_TEXT_CLASSES} from './constants';

export default module => {
  module.constant('ISSUE_IDS', ISSUE_IDS);
  module.constant('ISSUE_ICONS', ISSUE_ICONS);
  module.constant('ISSUE_TEXT_CLASSES', ISSUE_TEXT_CLASSES);
  module.component('issueCreateDialog', issueCreateDialog);
  module.directive('issueQuickCreate', issueQuickCreate);
  module.directive('issueRegistration', issueRegistration);
  module.component('issueTypeSelect', issueTypeSelect);
  module.service('issueUsersService', issueUsersService);
  module.service('IssueTypesService', IssueTypesService);
};
