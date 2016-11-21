import template from './appstore-field-integer.html';

export default function appstoreFieldInteger() {
  return {
    restrict: 'E',
    template: template,
    scope: {
      field: '=',
      model: '='
    },
    controller: FildController,
    controllerAs: '$ctrl',
    bindToController: true
  }
}


// @ngInject
class FildController {
  constructor($scope) {
    this.factor = this.getFactor();
    if (this.field.hasOwnProperty('min')) {
      this.value = this.field.min / this.factor;
      this.onChange();
    }
    $scope.$watch(() => this.field.min, newValue => {
      if (newValue !== undefined) {
        this.value = Math.max(this.value, newValue / this.factor);
      } else {
        this.value = 0;
      }
      this.onChange();
    });
    $scope.$watch(() => this.model[this.field.name], newValue => {
      if (newValue !== undefined) {
        this.value = newValue / this.factor;
      } else {
        this.value = 0;
      }
    });
  }

  onChange() {
    this.model[this.field.name] = this.value * this.factor;
  }

  getFactor() {
    if (this.field.factor) {
      let _factor = parseInt(this.field.factor);
      if (!isNaN(_factor)) {
        return _factor;
      }
    }
    return 1;
  }
}
