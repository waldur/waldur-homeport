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

class FildController {
  constructor() {
    this.factor = this.getFactor();
    if (this.field.min) {
      this.value = this.field.min
      this.onChange();
    }
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
