import template from './openstack-tenant-template-field.html';

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

function parsePackages(choices) {
  /* Output is list of items which have following format:
  {
    "url": "https://example.com/api/package-templates/2/",
    "name": "Minimal VPC package",
    "price": 300,
    "ram": 20240,
    "cores": 20,
    "storage": 51200,
  }
  */
  return choices.map(choice => {
    const components = choice.item.components.reduce((map, item) => {
      map[item.type] = item.amount;
      return map;
    }, {});
    return angular.extend({
      url: choice.item.url,
      name: choice.item.name,
      description: choice.item.description,
      price: choice.item.price,
    }, components);
  });
}

// @ngInject
class FieldController {
  constructor($uibModal) {
    this.$uibModal = $uibModal;
    this.packages = parsePackages(this.field.choices);
  }

  getLabel() {
    const field = this.model[this.field.name];
    if (field && field.name) {
      return field.name;
    } else {
      return 'Show choices';
    }
  }

  openDialog() {
    const vm = this;
    this.$uibModal.open({
      component: 'openstackTenantTemplateDialog',
      resolve: {
        field: () => vm.field,
        model: () => vm.model,
        packages: () => vm.packages
      }
    });
  }
}
