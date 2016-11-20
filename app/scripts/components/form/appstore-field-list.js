import template from './appstore-field-list.html';

export default function appstoreFieldList() {
  return {
    restrict: 'E',
    template: template,
    scope: {},
    controller: FieldController,
    controllerAs: '$ctrl',
    bindToController: {
      field: '=',
      model: '='
    }
  }
}

// @ngInject
class FieldController {
  constructor($uibModal, $filter) {
    this.$uibModal = $uibModal;
    this.$filter = $filter;

    if (this.field.parseChoices) {
      const choices = this.field.choices.map(this.field.parseChoices);
      this.field = angular.extend({}, this.field, {choices});
    }
  }

  renderWarning() {
    return this.field.required && !this.hasChoices();
  }

  hasChoices() {
    return this.field.choices.length > 0;
  }

  openDialog() {
    const vm = this;
    this.$uibModal.open({
      component: 'appstoreListDialog',
      resolve: {
        field: () => vm.field,
        model: () => vm.model
      },
      size: vm.field.dialogSize
    });
  }

  getLabel() {
    const value = this.model[this.field.name];
    if (!value) {
      return 'Show choices';
    }
    return this.field.formatValue(this.$filter, value);
  }
}
