import template from './issue-type-select.html';

const issueTypeSelect = {
  template,
  bindings: {
    model: '<',
    field: '<',
  },
  controller: class IssueTypeSelectController{
    // @ngInject
    constructor($scope, IssueTypesService) {
      this.$scope = $scope;
      this.service = IssueTypesService;
    }

    $onInit() {
      this.service.getAllTypes().then(types => this.types = types);
      this.$scope.$watch(() => this.model[this.field.name], val => {
        if (!this.types) {
          return;
        }
        const matches = this.types.filter(option => option.id === val);
        if (matches) {
          this.selected = matches[0];
        }
      });
    }

    updateModelValue(item) {
      this.model[this.field.name] = item.id;
      this.description = item.description;
    }
  }
};

export default issueTypeSelect;
