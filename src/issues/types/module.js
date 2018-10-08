import {ISSUE_IDS, ISSUE_ICONS, ISSUE_TEXT_CLASSES} from './constants';
import IssueTypesService from './issue-types-service';
import issueTypeSelect from './issue-type-select';
import issueTypeIcon from './issue-type-icon';

export default module => {
  module.constant('ISSUE_IDS', ISSUE_IDS);
  module.constant('ISSUE_ICONS', ISSUE_ICONS);
  module.constant('ISSUE_TEXT_CLASSES', ISSUE_TEXT_CLASSES);
  module.service('IssueTypesService', IssueTypesService);
  module.component('issueTypeSelect', issueTypeSelect);
  module.component('issueTypeIcon', issueTypeIcon);
};
