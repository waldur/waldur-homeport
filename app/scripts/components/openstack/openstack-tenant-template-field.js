import template from './openstack-tenant-template-field.html';
import { formatPackageDetails, parsePackage } from './utils';

export default function openstackTenantTemplateField() {
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
    this.packages = this.field.choices.map(parsePackage);
  }

  renderWarning() {
    return this.field.required && !this.hasChoices();
  }

  hasChoices() {
    return this.packages.length > 0;
  }

  openDialog() {
    const vm = this;
    this.$uibModal.open({
      component: 'openstackTenantTemplateDialog',
      size: 'lg',
      resolve: {
        field: () => vm.field,
        model: () => vm.model,
        packages: () => vm.packages
      }
    });
  }

  getLabel() {
    const value = this.model[this.field.name];
    if (!value) {
      return 'Show choices';
    }
    return formatPackageDetails(this.$filter, value);
  }
}
