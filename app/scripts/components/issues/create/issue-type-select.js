import template from './issue-type-select.html';

const issueTypeSelect = {
  template,
  bindings: {
    model: '<',
    field: '<',
  },
  controller: class IssueTypeSelectController{
    constructor(IssueTypesService) {
      // @ngInject
      this.service = IssueTypesService;
    }

    $onInit() {
      this.service.getAllTypes().then(types => this.types = types);
    }

    updateModelValue(item) {
      this.model[this.field.name] = item.id;
      this.description = item.description;
    }
  }
};

export default issueTypeSelect;
