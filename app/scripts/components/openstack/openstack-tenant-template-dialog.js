import template from './openstack-tenant-template-dialog.html';

export default function openstackTenantTemplateDialog() {
  return {
    restrict: 'E',
    template: template,
    scope: {},
    bindToController: {
      dismiss: '&',
      close: '&',
      resolve: '='
    },
    controller: DialogController,
    controllerAs: '$ctrl',
  }
}

class DialogController {
  constructor() {
    this.field = this.resolve.field;
    this.model = this.resolve.model;
    this.packages = this.resolve.packages;
    this.value = this.model[this.field.name];
  }

  selectPackage(item) {
    this.value = item;
  }

  confirm() {
    this.model[this.field.name] = this.value;
    this.close();
  }

  reset() {
    this.model[this.field.name] = null;
    this.dismiss();
  }
}
