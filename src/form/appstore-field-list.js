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
  };
}

class FieldController {
  // @ngInject
  constructor($uibModal, $filter, coreUtils) {
    this.$uibModal = $uibModal;
    this.$filter = $filter;
    this.coreUtils = coreUtils;

    if (this.field.parser) {
      const choices = this.field.choices.map(this.field.parser);
      this.field = angular.extend({}, this.field, {choices});
    }

    if (this.field.comparator) {
      const choices = this.field.choices.sort(this.field.comparator);
      this.field = angular.extend({}, this.field, {choices});
    }

    if (this.field.preselectFirst && this.field.choices.length > 0) {
      this.model[this.field.name] = this.field.choices[0];
    }

    this.hasChoices = this.field.choices && this.field.choices.length > 0;
    this.renderWarning = this.field.required && !this.hasChoices;
    this.renderEmpty = !this.field.required && !this.hasChoices;
    this.warningMessage = this.field.warningMessage ||
      this.coreUtils.templateFormatter(gettext('{fieldLabel} is required for provisioning resource.'),
        {fieldLabel: this.field.label});
    this.emptyMessage = this.field.emptyMessage || gettext('There are no items yet.');
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
