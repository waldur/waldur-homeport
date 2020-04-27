import { ISSUE_IDS } from './constants';
import issueTypeSelect from './issue-type-select';
import IssueTypesService from './issue-types-service';
import issueTypeIcon from './IssueTypeIcon';

export default module => {
  module.constant('ISSUE_IDS', ISSUE_IDS);
  module.service('IssueTypesService', IssueTypesService);
  module.component('issueTypeSelect', issueTypeSelect);
  module.component('issueTypeIcon', issueTypeIcon);
};
