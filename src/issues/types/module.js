import { ISSUE_IDS } from './constants';
import IssueTypesService from './issue-types-service';
import issueTypeSelect from './issue-type-select';
import issueTypeIcon from './IssueTypeIcon';

export default module => {
  module.constant('ISSUE_IDS', ISSUE_IDS);
  module.service('IssueTypesService', IssueTypesService);
  module.component('issueTypeSelect', issueTypeSelect);
  module.component('issueTypeIcon', issueTypeIcon);
};
