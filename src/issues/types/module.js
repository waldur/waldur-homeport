import IssueTypesService from './issue-types-service';
import issueTypeSelect from './issue-type-select';
import issueTypeIcon from './IssueTypeIcon';

export default module => {
  module.service('IssueTypesService', IssueTypesService);
  module.component('issueTypeSelect', issueTypeSelect);
  module.component('issueTypeIcon', issueTypeIcon);
};
