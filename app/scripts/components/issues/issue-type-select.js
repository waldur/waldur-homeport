import template from './issue-type-select.html';

const issueTypeSelect = {
  template,
  bindings: {
    model: '<',
    field: '<',
  },
  controller: function(IssueTypesService) {
    // @ngInject
    IssueTypesService.getAllTypes().then(types => this.types = types);
  }
};

export default issueTypeSelect;
