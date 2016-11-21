import template from './appstore-form.html';

export default function appstoreForm() {
  return {
    restrict: 'E',
    template: template,
    scope: {
      fields: '=',
      model: '=',
      errors: '='
    },
    controller: AppstoreFormController,
    controllerAs: '$ctrl',
    bindToController: true
  }
}

class AppstoreFormController {
  constructor($scope) {
    this.$scope = $scope;
    this.init();
  }

  init() {
    this.$scope.$watch('$ctrl.model.image', newImage => {
      if (newImage && this.model.flavor && newImage.min_disk > this.model.flavor.disk) {
        this.model.flavor = null;
      }
    });
    this.$scope.$watch('$ctrl.model.flavor', newFlavor => {
      if (newFlavor) {
        this.fields.options.system_volume_size.min = newFlavor.disk;
      }
    });
    this.$scope.$watch('$ctrl.fields', newFields => {
      if (newFields.order) {
        this.fieldsList = newFields.order.map(name =>
          angular.extend(newFields.options[name], {name: name});
      }
    });
  }

  renderLabel(field) {
    return field.type != 'boolean' && field.type != 'label';
  }
}
