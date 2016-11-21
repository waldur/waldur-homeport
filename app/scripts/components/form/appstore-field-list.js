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

    if (this.field.parser) {
      const choices = this.field.choices.map(this.field.parser);
      this.field = angular.extend({}, this.field, {choices});
    }

    this.hasChoices = this.field.choices && this.field.choices.length > 0;
    this.renderWarning = this.field.required && !this.hasChoices;
    this.renderEmpty = !this.field.required && !this.hasChoices;
    this.warningMessage = this.field.warningMessage || '{{ $ctrl.field.label }} is required for provisioning resource.';
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
    if (this.field.formatter) {
      return this.field.formatter(this.$filter, value);
    }
    return value.name;
  }
}
